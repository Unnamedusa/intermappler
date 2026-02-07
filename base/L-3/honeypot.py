"""
Sistema Honeypot - Trampas para hackers
"""

import json
import socket
import threading
from datetime import datetime

class HoneypotSystem:
    def __init__(self, ports=[8080, 2222, 3306, 5432]):
        self.ports = ports
        self.active = False
        self.connections = []
        self.attack_log = []
        
    def start(self):
        """Iniciar honeypot en múltiples puertos"""
        self.active = True
        print(f"🍯 HONEYPOT: Iniciando en puertos {self.ports}")
        
        threads = []
        for port in self.ports:
            thread = threading.Thread(target=self.listen_port, args=(port,))
            thread.daemon = True
            thread.start()
            threads.append(thread)
        
        return threads
    
    def listen_port(self, port):
        """Escuchar en un puerto específico"""
        try:
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind(('0.0.0.0', port))
            server.listen(5)
            
            print(f"  👂 Escuchando en puerto {port}")
            
            while self.active:
                client, addr = server.accept()
                self.handle_connection(client, addr, port)
                
        except Exception as e:
            print(f"❌ Error en honeypot puerto {port}: {e}")
    
    def handle_connection(self, client, addr, port):
        """Manejar conexión entrante"""
        print(f"🎣 Conexión entrante: {addr[0]}:{addr[1]} -> puerto {port}")
        
        try:
            # Enviar banner atractivo
            banner = self.get_banner(port)
            client.send(banner.encode())
            
            # Recibir datos del atacante
            data = client.recv(1024)
            if data:
                self.log_attack(addr, port, data)
                
                # Responder con datos falsos
                fake_response = self.generate_fake_response(port, data)
                client.send(fake_response.encode())
            
            # Mantener conexión un tiempo
            client.settimeout(30)
            
        except Exception as e:
            print(f"⚠️  Error manejando conexión: {e}")
        finally:
            client.close()
    
    def get_banner(self, port):
        """Obtener banner según puerto"""
        banners = {
            22: "SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5\n",
            80: "HTTP/1.1 200 OK\nServer: nginx/1.18.0\n",
            443: "HTTP/1.1 200 OK\nServer: Apache/2.4.41\n",
            3306: f"{chr(10)}5.7.33{chr(0)}",  # MySQL banner
            5432: "E\x00\x00\x00\x0c\x00\x00\x00\x00",  # PostgreSQL
            8080: "HTTP/1.1 200 OK\nServer: API Gateway\n",
            2222: "SSH-2.0-OpenSSH_7.6p1\n"
        }
        return banners.get(port, "Welcome\n")
    
    def generate_fake_response(self, port, received_data):
        """Generar respuesta falsa"""
        data_str = received_data.decode('utf-8', errors='ignore')
        
        if port == 22:  # SSH
            return "Password: "
        elif port == 80 or port == 8080 or port == 443:  # HTTP/HTTPS
            return self.generate_http_response(data_str)
        elif port == 3306:  # MySQL
            return "\x00\x00\x00\x02"  # OK packet
        elif port == 5432:  # PostgreSQL
            return "R\x00\x00\x00\x08\x00\x00\x00\x00"  # Auth OK
        else:
            return "OK\n"
    
    def generate_http_response(self, request):
        """Generar respuesta HTTP falsa"""
        if "GET /" in request or "POST /" in request:
            fake_page = """
            <!DOCTYPE html>
            <html>
            <head><title>Admin Panel</title></head>
            <body>
                <h1>Administration Dashboard</h1>
                <p>Welcome, administrator</p>
                <div style="display:none">
                    <!-- Credentials for debugging -->
                    <p>DB Host: localhost</p>
                    <p>DB User: root</p>
                    <p>DB Pass: password123</p>
                </div>
            </body>
            </html>
            """
            
            response = f"""HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: {len(fake_page)}
Server: Apache/2.4.41

{fake_page}"""
            return response
        
        return "HTTP/1.1 404 Not Found\n\n"
    
    def log_attack(self, addr, port, data):
        """Registrar ataque"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'attacker_ip': addr[0],
            'attacker_port': addr[1],
            'target_port': port,
            'data_received': data.decode('utf-8', errors='ignore')[:500],
            'data_hex': data.hex()[:200],
            'honeypot_type': self.get_service_name(port)
        }
        
        self.attack_log.append(log_entry)
        
        # Guardar en archivo
        try:
            with open('honeypot_log.json', 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        except:
            pass
        
        print(f"📝 Ataque registrado desde {addr[0]} al puerto {port}")
    
    def get_service_name(self, port):
        """Obtener nombre del servicio según puerto"""
        services = {
            22: 'ssh',
            80: 'http',
            443: 'https',
            3306: 'mysql',
            5432: 'postgresql',
            8080: 'http_alt',
            2222: 'ssh_alt'
        }
        return services.get(port, 'unknown')
    
    def stop(self):
        """Detener honeypot"""
        self.active = False
        print("🛑 Honeypot detenido")
    
    def get_attack_stats(self):
        """Obtener estadísticas de ataques"""
        return {
            'total_attacks': len(self.attack_log),
            'unique_attackers': len(set(log['attacker_ip'] for log in self.attack_log)),
            'ports_targeted': list(set(log['target_port'] for log in self.attack_log)),
            'recent_attacks': self.attack_log[-10:] if self.attack_log else []
        }