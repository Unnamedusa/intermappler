"""
Sistema reflector - Engaña y redirige atacantes
"""

import random
import time
from datetime import datetime

class AttackReflector:
    def __init__(self):
        self.fake_services = self.init_fake_services()
        self.attack_log = []
        
    def init_fake_services(self):
        """Inicializar servicios falsos"""
        return {
            'fake_api': {
                'endpoints': ['/api/v1/users', '/api/v1/admin', '/api/v1/data'],
                'response_delay': (0.5, 2.0),  # segundos
                'success_rate': 0.3  # 30% éxito para parecer real
            },
            'fake_db': {
                'host': 'localhost',
                'port': 5432,
                'db_name': 'production',
                'fake_queries': [
                    "SELECT * FROM users WHERE id = {}",
                    "UPDATE settings SET value = '{}' WHERE key = '{}'",
                    "DELETE FROM logs WHERE timestamp < '{}'"
                ]
            },
            'fake_admin': {
                'login_url': '/admin/login',
                'dashboard_url': '/admin/dashboard',
                'credentials': {
                    'username': 'admin',
                    'password': 'admin123'  # Falso obviamente
                }
            }
        }
    
    def reflect_attack(self, attack_type, attacker_data):
        """Reflejar/engañar un ataque"""
        print(f"🎭 REFLECTOR: Engañando ataque tipo {attack_type}")
        
        # Seleccionar estrategia basada en tipo de ataque
        if attack_type in ['sql_injection', 'db_traversal']:
            return self.reflect_database_attack(attacker_data)
        elif attack_type in ['xss', 'csrf']:
            return self.reflect_web_attack(attacker_data)
        elif attack_type in ['brute_force', 'credential_stuffing']:
            return self.reflect_auth_attack(attacker_data)
        else:
            return self.reflect_generic_attack(attacker_data)
    
    def reflect_database_attack(self, attacker_data):
        """Reflejar ataque a base de datos"""
        # Simular respuesta de base de datos
        fake_response = {
            'status': 'success',
            'query_executed': True,
            'rows_affected': random.randint(1, 100),
            'execution_time': f"{random.uniform(0.1, 1.5):.2f}s",
            'data': self.generate_fake_db_data()
        }
        
        # Añadir delay para parecer real
        time.sleep(random.uniform(*self.fake_services['fake_db']['response_delay']))
        
        self.log_reflection('database_attack', fake_response)
        return fake_response
    
    def reflect_web_attack(self, attacker_data):
        """Reflejar ataque web"""
        fake_response = {
            'status': 200,
            'message': 'OK',
            'content': '<html><body><h1>Access Granted</h1></body></html>',
            'cookies': {
                'session_id': f"fake_session_{random.randint(10000, 99999)}",
                'token': f"fake_token_{random.randint(100000, 999999)}"
            },
            'redirect': '/dashboard'
        }
        
        self.log_reflection('web_attack', fake_response)
        return fake_response
    
    def reflect_auth_attack(self, attacker_data):
        """Reflejar ataque de autenticación"""
        # Decidir aleatoriamente si "conceder" acceso
        grant_access = random.random() < self.fake_services['fake_api']['success_rate']
        
        if grant_access:
            fake_response = {
                'status': 'success',
                'message': 'Login successful',
                'user': {
                    'id': random.randint(1, 1000),
                    'username': 'admin',
                    'role': 'administrator',
                    'permissions': ['read', 'write', 'delete']
                },
                'token': f"access_token_{random.randint(1000000, 9999999)}"
            }
        else:
            fake_response = {
                'status': 'error',
                'message': 'Invalid credentials',
                'remaining_attempts': random.randint(1, 5),
                'lockout_time': '5 minutes'
            }
        
        self.log_reflection('auth_attack', fake_response)
        return fake_response
    
    def reflect_generic_attack(self, attacker_data):
        """Reflejar ataque genérico"""
        fake_response = {
            'status': 'processed',
            'message': 'Request completed successfully',
            'timestamp': datetime.now().isoformat(),
            'request_id': f"req_{random.randint(100000, 999999)}",
            'debug_info': 'All systems operational'
        }
        
        self.log_reflection('generic_attack', fake_response)
        return fake_response
    
    def generate_fake_db_data(self):
        """Generar datos falsos de base de datos"""
        return {
            'users': [
                {'id': i, 'username': f'user{i}', 'email': f'user{i}@example.com'}
                for i in range(1, random.randint(5, 20))
            ],
            'settings': {
                'theme': 'dark',
                'language': 'en',
                'timezone': 'UTC'
            },
            'stats': {
                'total_records': random.randint(1000, 10000),
                'active_users': random.randint(50, 500),
                'storage_used': f"{random.randint(10, 500)}GB"
            }
        }
    
    def log_reflection(self, attack_type, response):
        """Registrar reflexión de ataque"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'attack_type': attack_type,
            'response_sent': response,
            'strategy': 'reflection'
        }
        
        self.attack_log.append(log_entry)
        
        # Mantener solo últimos 1000 registros
        if len(self.attack_log) > 1000:
            self.attack_log = self.attack_log[-1000:]
        
        print(f"📝 Reflexión registrada: {attack_type}")
    
    def get_attack_log(self):
        """Obtener registro de ataques"""
        return self.attack_log