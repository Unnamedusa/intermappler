"""
Detector de amenazas avanzado
"""

import re
import ipaddress
from datetime import datetime

class ThreatDetector:
    def __init__(self):
        self.patterns = self.load_patterns()
        self.suspicious_ips = set()
        
    def load_patterns(self):
        """Cargar patrones de ataque"""
        return {
            'sql_injection': [
                r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
                r"((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))",
                r"\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))"
            ],
            'xss': [
                r"((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)",
                r"((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))",
                r"((\%3C)|<)[^\n]+((\%3E)|>)"
            ],
            'path_traversal': [
                r"\.\.\/",
                r"\.\.\\",
                r"\/etc\/",
                r"\/bin\/",
                r"\/usr\/"
            ],
            'command_injection': [
                r";\s*\w+",
                r"\|\s*\w+",
                r"&\s*\w+",
                r"`\s*\w+"
            ]
        }
    
    def detect(self, data, source_ip=None):
        """Detectar amenazas en datos"""
        threats = []
        data_str = str(data)
        
        # Verificar IP sospechosa
        if source_ip and self.is_suspicious_ip(source_ip):
            threats.append({
                'type': 'suspicious_ip',
                'severity': 'high',
                'ip': source_ip
            })
        
        # Buscar patrones de ataque
        for threat_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, data_str, re.IGNORECASE):
                    threats.append({
                        'type': threat_type,
                        'severity': self.get_severity(threat_type),
                        'pattern': pattern
                    })
                    break
        
        # Análisis de frecuencia y comportamiento
        if self.is_brute_force_pattern(data_str):
            threats.append({
                'type': 'brute_force_attempt',
                'severity': 'medium'
            })
        
        return threats
    
    def is_suspicious_ip(self, ip):
        """Verificar si IP es sospechosa"""
        try:
            ip_obj = ipaddress.ip_address(ip)
            
            # IPs reservadas/locales (podrían ser proxies/VPN)
            if ip_obj.is_private or ip_obj.is_loopback:
                return False
                
            # Lista negra simple (en producción sería una DB)
            blacklisted_ranges = [
                '10.0.0.0/8',
                '192.168.0.0/16',
                '172.16.0.0/12'
            ]
            
            for range_str in blacklisted_ranges:
                if ip_obj in ipaddress.ip_network(range_str):
                    return True
                    
        except ValueError:
            return True
        
        return ip in self.suspicious_ips
    
    def is_brute_force_pattern(self, data):
        """Detectar patrones de fuerza bruta"""
        keywords = ['login', 'password', 'auth', 'admin', 'user', 'pass']
        data_lower = data.lower()
        
        # Contar ocurrencias de palabras clave
        count = sum(1 for kw in keywords if kw in data_lower)
        
        return count >= 3  # Múltiples palabras clave = sospechoso
    
    def get_severity(self, threat_type):
        """Obtener severidad de tipo de amenaza"""
        severity_map = {
            'sql_injection': 'high',
            'xss': 'high',
            'command_injection': 'critical',
            'path_traversal': 'medium',
            'suspicious_ip': 'low',
            'brute_force_attempt': 'medium'
        }
        return severity_map.get(threat_type, 'low')