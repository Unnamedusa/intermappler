#!/usr/bin/env python3
"""
Sneaker Advisor - Sistema de protección activa inteligente
Analiza y protege datos en tiempo real con técnicas avanzadas
"""

import sys
import json
import hashlib
import random
import time
from datetime import datetime
import base64
import re

class SneakerAdvisor:
    def __init__(self):
        self.name = "Sneaker Advisor"
        self.version = "3.0.0"
        self.protection_mode = "active"
        self.analysis_history = []
        
        # Configuración de seguridad
        self.config = {
            "threat_level": 0,
            "auto_response": True,
            "honeypot_enabled": True,
            "deep_analysis": True,
            "response_time": 2.0  # segundos máximo
        }
        
        # Patrones de amenazas conocidas
        self.threat_patterns = [
            (r"<script>", "XSS injection attempt", 10),
            (r"union.*select", "SQL injection attempt", 15),
            (r"drop.*table", "SQL drop table attempt", 20),
            (r"etc/passwd", "File inclusion attempt", 12),
            (r"\.\./", "Directory traversal attempt", 8),
            (r"javascript:", "JS injection attempt", 10),
            (r"onload=", "HTML injection attempt", 7),
            (r"eval\(", "Code execution attempt", 15),
            (r"base64_decode", "Obfuscation attempt", 5),
            (r"\\x[0-9a-f]{2}", "Hex encoded attack", 6)
        ]
        
        print(f"[Sneaker Advisor v{self.version}] Initialized", file=sys.stderr)
    
    def analyze_threats(self, data):
        """Analiza datos en busca de amenazas"""
        analysis = {
            "threat_level": 0,
            "patterns_found": [],
            "recommendations": [],
            "timestamp": datetime.now().isoformat()
        }
        
        if isinstance(data, str):
            data_str = data
        elif isinstance(data, dict):
            data_str = json.dumps(data)
        else:
            data_str = str(data)
        
        # Análisis de patrones
        for pattern, description, severity in self.threat_patterns:
            if re.search(pattern, data_str, re.IGNORECASE):
                analysis["threat_level"] += severity
                analysis["patterns_found"].append({
                    "pattern": pattern,
                    "description": description,
                    "severity": severity
                })
        
        # Análisis de longitud
        if len(data_str) > 100000:  # 100KB
            analysis["threat_level"] += 5
            analysis["recommendations"].append("Data size exceeds safe limit")
        
        # Análisis de codificación
        try:
            # Intentar detectar codificaciones peligrosas
            if data_str.count('%') > len(data_str) * 0.1:  # 10% son %
                analysis["threat_level"] += 3
                analysis["recommendations"].append("High percentage of URL encoding")
        except:
            pass
        
        # Limitar nivel de amenaza
        analysis["threat_level"] = min(analysis["threat_level"], 100)
        
        # Registrar análisis
        self.analysis_history.append(analysis)
        if len(self.analysis_history) > 1000:
            self.analysis_history = self.analysis_history[-1000:]
        
        return analysis
    
    def protect_data(self, data, metadata=None):
        """Protege los datos aplicando técnicas avanzadas"""
        start_time = time.time()
        
        # Analizar amenazas primero
        threat_analysis = self.analyze_threats(data)
        
        # Convertir datos a string si es necesario
        if isinstance(data, dict):
            data_str = json.dumps(data)
        else:
            data_str = str(data)
        
        # Aplicar protección basada en nivel de amenaza
        if threat_analysis["threat_level"] > 50:
            # Nivel alto de amenaza - protección máxima
            protected = self._maximum_protection(data_str)
            protection_level = "maximum"
        elif threat_analysis["threat_level"] > 20:
            # Nivel medio de amenaza - protección estándar
            protected = self._standard_protection(data_str)
            protection_level = "standard"
        else:
            # Nivel bajo de amenaza - protección básica
            protected = self._basic_protection(data_str)
            protection_level = "basic"
        
        # Añadir honeypot si está habilitado
        if self.config["honeypot_enabled"]:
            protected = self._add_honeypot(protected)
        
        # Generar metadata de protección
        protection_metadata = {
            "protection_level": protection_level,
            "threat_analysis": threat_analysis,
            "processing_time": time.time() - start_time,
            "timestamp": datetime.now().isoformat(),
            "advisor_version": self.version,
            "checksum": self._generate_checksum(protected)
        }
        
        if metadata:
            protection_metadata.update(metadata)
        
        return {
            "protected_data": protected,
            "metadata": protection_metadata,
            "success": True
        }
    
    def revert_protection(self, protected_data):
        """Reverte la protección aplicada a los datos"""
        try:
            if isinstance(protected_data, str):
                protected = json.loads(protected_data)
            else:
                protected = protected_data
            
            # Extraer datos protegidos
            data = protected.get("protected_data", "")
            metadata = protected.get("metadata", {})
            
            # Verificar checksum
            expected_checksum = metadata.get("checksum", "")
            actual_checksum = self._generate_checksum(data)
            
            if expected_checksum and expected_checksum != actual_checksum:
                return {
                    "error": "Checksum validation failed",
                    "success": False
                }
            
            # Revertir protección basada en nivel
            protection_level = metadata.get("protection_level", "basic")
            
            if protection_level == "maximum":
                original = self._revert_maximum_protection(data)
            elif protection_level == "standard":
                original = self._revert_standard_protection(data)
            else:
                original = self._revert_basic_protection(data)
            
            # Remover honeypot
            if metadata.get("honeypot_added", False):
                original = self._remove_honeypot(original)
            
            # Intentar convertir de vuelta a JSON si era un dict
            try:
                result = json.loads(original)
            except:
                result = original
            
            return {
                "original_data": result,
                "success": True,
                "processing_time": time.time() - time.time()
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }
    
    # ========== MÉTODOS DE PROTECCIÓN ==========
    
    def _basic_protection(self, data):
        """Protección básica - ofuscación simple"""
        # XOR con clave dinámica
        key = self._generate_dynamic_key(data)
        obfuscated = ""
        
        for i, char in enumerate(data):
            key_char = key[i % len(key)]
            obfuscated += chr(ord(char) ^ ord(key_char))
        
        # Codificación base64 personalizada
        encoded = base64.b64encode(obfuscated.encode()).decode()
        
        # Mezclar alfabeto base64
        custom_alphabet = "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/="
        standard_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        
        translated = ""
        for char in encoded:
            if char in standard_alphabet:
                idx = standard_alphabet.index(char)
                translated += custom_alphabet[idx]
            else:
                translated += char
        
        return translated
    
    def _revert_basic_protection(self, data):
        """Revertir protección básica"""
        # Revertir alfabeto personalizado
        custom_alphabet = "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/="
        standard_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        
        translated = ""
        for char in data:
            if char in custom_alphabet:
                idx = custom_alphabet.index(char)
                translated += standard_alphabet[idx]
            else:
                translated += char
        
        # Decodificar base64
        obfuscated = base64.b64decode(translated.encode()).decode()
        
        # Revertir XOR
        key = self._generate_dynamic_key(obfuscated)
        original = ""
        
        for i, char in enumerate(obfuscated):
            key_char = key[i % len(key)]
            original += chr(ord(char) ^ ord(key_char))
        
        return original
    
    def _standard_protection(self, data):
        """Protección estándar - más avanzada"""
        # Primero protección básica
        basic = self._basic_protection(data)
        
        # Añadir rotación de bits
        rotated = ""
        for i, char in enumerate(basic):
            char_code = ord(char)
            rotation = (i % 7) + 1
            rotated_char = ((char_code << rotation) | (char_code >> (8 - rotation))) & 0xFF
            rotated += chr(rotated_char)
        
        # Compresión simple
        compressed = ""
        i = 0
        while i < len(rotated):
            if i + 1 < len(rotated):
                pair = (ord(rotated[i]) << 8) | ord(rotated[i + 1])
                compressed += chr((pair ^ 0x55AA) & 0xFF)
                compressed += chr(((pair ^ 0x55AA) >> 8) & 0xFF)
                i += 2
            else:
                compressed += rotated[i]
                i += 1
        
        return compressed
    
    def _revert_standard_protection(self, data):
        """Revertir protección estándar"""
        # Descomprimir
        decompressed = ""
        i = 0
        while i < len(data):
            if i + 1 < len(data):
                pair = (ord(data[i + 1]) << 8) | ord(data[i])
                original_pair = pair ^ 0x55AA
                decompressed += chr((original_pair >> 8) & 0xFF)
                decompressed += chr(original_pair & 0xFF)
                i += 2
            else:
                decompressed += data[i]
                i += 1
        
        # Revertir rotación
        derotated = ""
        for i, char in enumerate(decompressed):
            char_code = ord(char)
            rotation = (i % 7) + 1
            original_char = ((char_code >> rotation) | (char_code << (8 - rotation))) & 0xFF
            derotated += chr(original_char)
        
        # Revertir protección básica
        return self._revert_basic_protection(derotated)
    
    def _maximum_protection(self, data):
        """Protección máxima - para amenazas graves"""
        # Aplicar múltiples capas
        layers = []
        
        # Capa 1: Ofuscación múltiple
        layer1 = self._standard_protection(data)
        layers.append(("standard", layer1))
        
        # Capa 2: Encriptación con múltiples pasadas
        layer2 = self._multi_pass_encryption(layer1)
        layers.append(("multi_pass", layer2))
        
        # Capa 3: Añadir ruido
        layer3 = self._add_cryptographic_noise(layer2)
        layers.append(("noise", layer3))
        
        # Capa 4: Codificación final
        final = base64.b85encode(layer3.encode()).decode()
        
        return final
    
    def _revert_maximum_protection(self, data):
        """Revertir protección máxima"""
        try:
            # Capa 4: Decodificar base85
            layer3 = base64.b85decode(data.encode()).decode()
            
            # Capa 3: Remover ruido
            layer2 = self._remove_cryptographic_noise(layer3)
            
            # Capa 2: Revertir encriptación múltiple
            layer1 = self._revert_multi_pass_encryption(layer2)
            
            # Capa 1: Revertir protección estándar
            return self._revert_standard_protection(layer1)
            
        except Exception as e:
            raise Exception(f"Failed to revert maximum protection: {str(e)}")
    
    def _multi_pass_encryption(self, data):
        """Encriptación de múltiples pasadas"""
        result = data
        
        # Aplicar 3 pasadas diferentes
        for pass_num in range(3):
            key = f"sneaker_pass_{pass_num}_{hashlib.sha256(data.encode()).hexdigest()[:16]}"
            encrypted = ""
            
            for i, char in enumerate(result):
                key_char = key[i % len(key)]
                # XOR con transformación no lineal
                xor_val = ord(char) ^ ord(key_char)
                # Rotación basada en posición
                rotation = (i + pass_num) % 8
                rotated = ((xor_val << rotation) | (xor_val >> (8 - rotation))) & 0xFF
                encrypted += chr(rotated)
            
            result = encrypted
        
        return result
    
    def _revert_multi_pass_encryption(self, data):
        """Revertir encriptación de múltiples pasadas"""
        result = data
        
        # Revertir en orden inverso
        for pass_num in range(2, -1, -1):
            key = f"sneaker_pass_{pass_num}_{hashlib.sha256(result.encode()).hexdigest()[:16]}"
            decrypted = ""
            
            for i, char in enumerate(result):
                key_char = key[i % len(key)]
                char_code = ord(char)
                # Revertir rotación
                rotation = (i + pass_num) % 8
                derotated = ((char_code >> rotation) | (char_code << (8 - rotation))) & 0xFF
                # Revertir XOR
                original = derotated ^ ord(key_char)
                decrypted += chr(original)
            
            result = decrypted
        
        return result
    
    def _add_cryptographic_noise(self, data):
        """Añade ruido criptográfico"""
        noise_positions = []
        result = list(data)
        
        # Añadir bytes aleatorios en posiciones específicas
        for i in range(0, len(data), 10):
            if i < len(data):
                # Guardar posición original
                noise_positions.append(i)
                # Insertar byte aleatorio
                result.insert(i + 1, chr(random.randint(0, 255)))
        
        # Añadir marcador de posiciones de ruido (ofuscado)
        marker = f"NOISE_POS:{','.join(map(str, noise_positions))}:END"
        marker_encoded = base64.b64encode(marker.encode()).decode()
        
        # Insertar marcador al final
        return ''.join(result) + "|" + marker_encoded
    
    def _remove_cryptographic_noise(self, data):
        """Remueve ruido criptográfico"""
        # Separar datos y marcador
        if '|' in data:
            data_part, marker_part = data.rsplit('|', 1)
        else:
            data_part, marker_part = data, ""
        
        # Decodificar marcador si existe
        noise_positions = []
        if marker_part:
            try:
                marker = base64.b64decode(marker_part.encode()).decode()
                if marker.startswith("NOISE_POS:") and marker.endswith(":END"):
                    positions_str = marker[10:-4]
                    noise_positions = list(map(int, positions_str.split(',')))
            except:
                pass
        
        # Remover ruido de las posiciones conocidas
        if noise_positions:
            result = list(data_part)
            # Remover en orden inverso para no afectar índices
            for pos in sorted(noise_positions, reverse=True):
                if pos + 1 < len(result):
                    del result[pos + 1]
            
            return ''.join(result)
        
        return data_part
    
    def _add_honeypot(self, data):
        """Añade datos honeypot"""
        honeypots = [
            f"FAKE_SESSION:{random.randint(100000, 999999)}",
            f"DUMMY_TOKEN:{hashlib.md5(str(time.time()).encode()).hexdigest()}",
            f"TRAP_DATA:{datetime.now().isoformat()}"
        ]
        
        # Insertar honeypots en posiciones aleatorias
        result = data
        positions = sorted(random.sample(range(len(data)), min(3, len(data))))
        
        for i, pos in enumerate(positions):
            if i < len(honeypots):
                honeypot = f"[HONEYPOT:{honeypots[i]}]"
                result = result[:pos] + honeypot + result[pos:]
        
        return result
    
    def _remove_honeypot(self, data):
        """Remueve datos honeypot"""
        pattern = r'\[HONEYPOT:[^\]]+\]'
        return re.sub(pattern, '', data)
    
    def _generate_dynamic_key(self, data):
        """Genera una clave dinámica basada en los datos"""
        # Usar hash de los datos como base para la clave
        data_hash = hashlib.sha256(data.encode()).hexdigest()
        
        # Mezclar con timestamp para mayor aleatoriedad
        timestamp = str(time.time()).encode()
        timestamp_hash = hashlib.sha256(timestamp).hexdigest()
        
        # Combinar y truncar a 32 caracteres
        combined = hashlib.sha256((data_hash + timestamp_hash).encode()).hexdigest()
        return combined[:32]
    
    def _generate_checksum(self, data):
        """Genera checksum para verificación de integridad"""
        if isinstance(data, str):
            data_bytes = data.encode()
        else:
            data_bytes = str(data).encode()
        
        return hashlib.sha512(data_bytes).hexdigest()
    
    def get_stats(self):
        """Obtiene estadísticas del advisor"""
        return {
            "name": self.name,
            "version": self.version,
            "protection_mode": self.protection_mode,
            "analysis_count": len(self.analysis_history),
            "avg_threat_level": sum(a["threat_level"] for a in self.analysis_history) / max(1, len(self.analysis_history)),
            "config": self.config
        }
    
    def handle_command(self, command, parameters=None):
        """Maneja comandos del sistema Node.js"""
        if command == "stats":
            return self.get_stats()
        elif command == "config":
            if parameters:
                for key, value in parameters.items():
                    if key in self.config:
                        self.config[key] = value
            return {"config": self.config}
        elif command == "analyze":
            data = parameters.get("data", "") if parameters else ""
            return self.analyze_threats(data)
        elif command == "test":
            return {"status": "ok", "timestamp": datetime.now().isoformat()}
        else:
            return {"error": f"Unknown command: {command}"}

# ========== INTERFAZ PRINCIPAL ==========

def main():
    """Función principal para interfaz con Node.js"""
    advisor = SneakerAdvisor()
    
    try:
        # Leer input de stdin
        input_data = sys.stdin.read()
        
        if not input_data:
            # Modo interactivo/testing
            result = advisor.get_stats()
        else:
            # Parsear JSON input
            try:
                request = json.loads(input_data)
                action = request.get("action", "")
                
                if action == "protect":
                    data = request.get("data", "")
                    metadata = request.get("metadata", {})
                    result = advisor.protect_data(data, metadata)
                
                elif action == "revert":
                    protected_data = request.get("data", {})
                    result = advisor.revert_protection(protected_data)
                
                elif action == "command":
                    command = request.get("command", "")
                    parameters = request.get("parameters", {})
                    result = advisor.handle_command(command, parameters)
                
                else:
                    result = {"error": f"Unknown action: {action}", "success": False}
            
            except json.JSONDecodeError as e:
                result = {"error": f"Invalid JSON: {str(e)}", "success": False}
            except Exception as e:
                result = {"error": str(e), "success": False}
        
        # Output resultado como JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            "error": f"Advisor critical error: {str(e)}",
            "success": False,
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()