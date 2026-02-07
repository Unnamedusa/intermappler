#!/usr/bin/env python3
"""
CAPA 3: SNEKER - Sistema anti-hacker Python
"""

import json
import hashlib
import random
import socket
import struct
from datetime import datetime
import sys
import os

class SneakerSystem:
    def __init__(self):
        self.mode = "normal"
        self.honeypots = []
        self.threat_level = 0
        self.init_honeypots()
    
    def init_honeypots(self):
        """Inicializar honeypots (trampas para hackers)"""
        self.honeypots = [
            {
                "name": "Fake_API_Endpoint",
                "type": "api_trap",
                "data": self.generate_fake_api_data()
            },
            {
                "name": "Fake_Database",
                "type": "db_trap", 
                "data": self.generate_fake_db_data()
            },
            {
                "name": "Fake_Admin_Panel",
                "type": "admin_trap",
                "data": self.generate_fake_admin_data()
            }
        ]
    
    def protect(self, data):
        """Proteger datos activamente"""
        print("🛡️  SNEKER: Activando protección...")
        
        # Analizar amenazas
        threat_analysis = self.analyze_threats(data)
        
        if threat_analysis["is_threat"]:
            print(f"🚨 AMENAZA DETECTADA: {threat_analysis['threat_type']}")
            self.threat_level += 1
            self.activate_defense_mode()
            
            # Activar honeypot
            honeypot_data = self.activate_honeypot(threat_analysis)
            
            # Engañar al atacante
            fake_response = self.generate_fake_response(data, honeypot_data)
            
            # Registrar ataque
            self.log_attack(threat_analysis)
            
            # Obtener información del atacante (limitada)
            attacker_info = self.get_attacker_info(threat_analysis)
            
            return {
                "protected_data": self.obfuscate_real_data(data),
                "fake_response": fake_response,
                "mode": "sneaker_active",
                "attacker_info": attacker_info,
                "timestamp": datetime.now().isoformat()
            }
        
        # Modo normal
        return {
            "protected_data": data,
            "mode": "normal",
            "timestamp": datetime.now().isoformat()
        }
    
    def revert(self, protected_data):
        """Revertir protección"""
        if protected_data.get("mode") == "sneaker_active":
            print("🔙 SNEKER: Revertiendo protección...")
            return self.deobfuscate_real_data(protected_data["protected_data"])
        return protected_data.get("protected_data", protected_data)
    
    def analyze_threats(self, data):
        """Analizar datos en busca de amenazas"""
        threats = {
            "is_threat": False,
            "threat_type": None,
            "confidence": 0
        }
        
        # Convertir a string para análisis
        data_str = str(data).lower()
        
        # Patrones de ataque comunes
        attack_patterns = {
            "sql_injection": ["select", "union", "drop", "insert", "delete", "1=1", "' or '1'='1"],
            "xss": ["<script>", "javascript:", "onload=", "onerror="],
            "directory_traversal": ["../", "..\\", "/etc/passwd"],
            "command_injection": [";", "|", "&", "`", "$("],
            "brute_force": ["admin", "password", "login", "user", "pass"]
        }
        
        for threat_type, patterns in attack_patterns.items():
            for pattern in patterns:
                if pattern in data_str:
                    threats["is_threat"] = True
                    threats["threat_type"] = threat_type
                    threats["confidence"] = 85
                    return threats
        
        # Análisis de frecuencia (posible brute force)
        if len(data_str.split()) < 3 and any(word in data_str for word in ["admin", "root", "test"]):
            threats["is_threat"] = True
            threats["threat_type"] = "suspicious_input"
            threats["confidence"] = 60
        
        return threats
    
    def activate_defense_mode(self):
        """Activar modo de defensa"""
        if self.threat_level > 5:
            self.mode = "paranoid"
            print("🔴 MODO PARANOICO ACTIVADO")
        elif self.threat_level > 2:
            self.mode = "high_alert"
            print("🟡 MODO ALERTA ALTA ACTIVADO")
        else:
            self.mode = "defensive"
            print("🟢 MODO DEFENSIVO ACTIVADO")
    
    def activate_honeypot(self, threat_analysis):
        """Activar honeypot apropiado"""
        honeypot = random.choice(self.honeypots)
        honeypot["activated_at"] = datetime.now().isoformat()
        honeypot["threat_type"] = threat_analysis["threat_type"]
        
        print(f"🎣 HONEYPOT ACTIVADO: {honeypot['name']}")
        
        return honeypot
    
    def generate_fake_response(self, original_data, honeypot):
        """Generar respuesta falsa para engañar al atacante"""
        fake_map = {
            "api_trap": {
                "status": "success",
                "message": "Access granted",
                "token": f"fake_token_{random.randint(100000, 999999)}",
                "data": {
                    "users": self.generate_fake_users(),
                    "permissions": ["admin", "write", "delete"],
                    "session_id": f"session_{random.randint(1000, 9999)}"
                }
            },
            "db_trap": {
                "database": "main_db",
                "tables": ["users", "passwords", "transactions"],
                "connection": "established",
                "records": random.randint(1000, 10000),
                "fake_data": True
            },
            "admin_trap": {
                "admin_access": True,
                "panel_url": "/admin/dashboard",
                "credentials": {
                    "username": "admin",
                    "password": "********"
                },
                "system_info": "All systems operational"
            }
        }
        
        return fake_map.get(honeypot["type"], {"error": "No honeypot available"})
    
    def get_attacker_info(self, threat_analysis):
        """Obtener información limitada del atacante"""
        info = {
            "threat_type": threat_analysis["threat_type"],
            "timestamp": datetime.now().isoformat(),
            "detection_method": "sneaker_system",
            "suggested_action": "monitor_and_log"
        }
        
        # Intentar obtener IP (limitado por privacidad)
        try:
            # Esto es solo para demostración
            # En producción se usarían métodos apropiados
            hostname = socket.gethostname()
            info["server_hostname"] = hostname
        except:
            info["server_hostname"] = "unknown"
        
        return info
    
    def log_attack(self, threat_analysis):
        """Registrar ataque en log"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "threat_type": threat_analysis["threat_type"],
            "confidence": threat_analysis["confidence"],
            "system_mode": self.mode,
            "threat_level": self.threat_level
        }
        
        log_file = "security_incidents.log"
        try:
            with open(log_file, "a") as f:
                f.write(json.dumps(log_entry) + "\n")
        except:
            # Fallback a consola
            print(f"📝 LOG: {json.dumps(log_entry)}")
    
    def obfuscate_real_data(self, data):
        """Ofuscar datos reales"""
        # Simple ofuscación por demostración
        data_str = json.dumps(data) if not isinstance(data, str) else data
        
        # XOR ofuscation con clave temporal
        key = hashlib.sha256(str(datetime.now().timestamp()).encode()).hexdigest()
        obfuscated = ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(data_str))
        
        return obfuscated
    
    def deobfuscate_real_data(self, obfuscated_data):
        """Desofuscar datos reales"""
        # Esto necesitaría la clave original
        # Simplificado para demostración
        try:
            return obfuscated_data  # En realidad se revertiría la ofuscación
        except:
            return obfuscated_data
    
    # Métodos auxiliares para generar datos falsos
    def generate_fake_api_data(self):
        return {"api_version": "2.0", "endpoints": 15, "active": True}
    
    def generate_fake_db_data(self):
        return {"db_name": "production_db", "size_gb": 245, "tables": 42}
    
    def generate_fake_admin_data(self):
        return {"admin_id": 1, "role": "superadmin", "access_level": 10}
    
    def generate_fake_users(self):
        return [
            {"id": 1, "username": "admin", "role": "administrator"},
            {"id": 2, "username": "user1", "role": "viewer"},
            {"id": 3, "username": "user2", "role": "editor"}
        ]

# Interfaz para Node.js
def protect_data(data_json):
    sneaker = SneakerSystem()
    data = json.loads(data_json)
    result = sneaker.protect(data)
    return json.dumps(result)

def revert_protection(protected_json):
    sneaker = SneakerSystem()
    protected = json.loads(protected_json)
    result = sneaker.revert(protected)
    return json.dumps(result) if isinstance(result, dict) else result

if __name__ == "__main__":
    # Ejecutar pruebas
    test_data = {"test": "data", "sensitive": True}
    protected = protect_data(json.dumps(test_data))
    print(f"Protected: {protected[:100]}...")
    
    reverted = revert_protection(protected)
    print(f"Reverted: {reverted}")