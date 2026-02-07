// Sistema de Jerarquía de Roles y Permisos

class RoleHierarchy {
    constructor() {
        this.roles = this.loadRoles();
        this.permissions = this.loadPermissions();
    }

    loadRoles() {
        return {
            // Nivel 100: Control Total
            MAP_ENGINEER: {
                id: 'MAP_ENGINEER',
                name: 'Ingeniero de Mapa',
                level: 100,
                inheritsFrom: ['ADMINISTRATOR', 'INTELLIGENCE', 'MILITARY', 'POLICE', 'SPECIALIST', 'PUBLIC'],
                canManage: ['ALL_ROLES'],
                accessScope: 'global'
            },

            // Nivel 90: Administración
            ADMINISTRATOR: {
                id: 'ADMINISTRATOR',
                name: 'Administrador',
                level: 90,
                inheritsFrom: ['INTELLIGENCE', 'MILITARY', 'POLICE', 'SPECIALIST', 'PUBLIC'],
                canManage: ['INTELLIGENCE', 'MILITARY', 'POLICE', 'SPECIALIST', 'PUBLIC'],
                accessScope: 'administrative'
            },

            // Nivel 80: Inteligencia
            INTELLIGENCE: {
                id: 'INTELLIGENCE',
                name: 'Inteligencia',
                level: 80,
                inheritsFrom: ['MILITARY', 'POLICE', 'SPECIALIST', 'PUBLIC'],
                canManage: ['MILITARY', 'POLICE', 'SPECIALIST'],
                accessScope: 'classified'
            },

            // Nivel 70: Militar
            MILITARY: {
                id: 'MILITARY',
                name: 'Militar',
                level: 70,
                inheritsFrom: ['POLICE', 'SPECIALIST', 'PUBLIC'],
                canManage: ['POLICE', 'SPECIALIST'],
                accessScope: 'strategic'
            },

            // Nivel 60: Policía
            POLICE: {
                id: 'POLICE',
                name: 'Policía',
                level: 60,
                inheritsFrom: ['SPECIALIST', 'PUBLIC'],
                canManage: ['SPECIALIST'],
                accessScope: 'operational'
            },

            // Nivel 50: Especialistas (sin jerarquía interna)
            SPECIALIST: {
                id: 'SPECIALIST',
                name: 'Especialista',
                level: 50,
                inheritsFrom: ['PUBLIC'],
                canManage: [],
                subroles: ['PERIODISTA', 'ASTROLOGO', 'ASTRONOMO', 'METEOROLOGO', 'GEOLOGO', 'SOCIOLOGO'],
                accessScope: 'specialized'
            },

            // Nivel 10: Público
            PUBLIC: {
                id: 'PUBLIC',
                name: 'Público',
                level: 10,
                inheritsFrom: [],
                canManage: [],
                accessScope: 'public'
            }
        };
    }

    loadPermissions() {
        return {
            // Permisos de Sistema
            SYSTEM: {
                VIEW_DASHBOARD: 'system.view_dashboard',
                MANAGE_USERS: 'system.manage_users',
                VIEW_LOGS: 'system.view_logs',
                SYSTEM_CONFIG: 'system.config',
                SECURITY_OVERRIDE: 'system.security_override'
            },

            // Permisos de Mapa
            MAP: {
                VIEW_BASIC_MAP: 'map.view_basic',
                VIEW_ADVANCED_MAP: 'map.view_advanced',
                EDIT_MAP_LAYERS: 'map.edit_layers',
                CREATE_MAP: 'map.create',
                DELETE_MAP: 'map.delete',
                EXPORT_MAP_DATA: 'map.export_data'
            },

            // Permisos de Datos
            DATA: {
                VIEW_PUBLIC_DATA: 'data.view_public',
                VIEW_CLASSIFIED_DATA: 'data.view_classified',
                VIEW_STRATEGIC_DATA: 'data.view_strategic',
                VIEW_OPERATIONAL_DATA: 'data.view_operational',
                EDIT_DATA: 'data.edit',
                IMPORT_DATA: 'data.import',
                ANALYZE_DATA: 'data.analyze',
                EXPORT_DATA: 'data.export'
            },

            // Permisos de Comunicación
            COMMUNICATION: {
                SEND_ALERTS: 'comm.send_alerts',
                SECURE_MESSAGING: 'comm.secure_messaging',
                BROADCAST: 'comm.broadcast',
                VIEW_COMMS: 'comm.view'
            },

            // Permisos de Análisis
            ANALYSIS: {
                REAL_TIME_ANALYSIS: 'analysis.real_time',
                PREDICTIVE_ANALYSIS: 'analysis.predictive',
                PATTERN_DETECTION: 'analysis.pattern_detection',
                THREAT_ANALYSIS: 'analysis.threat',
                WEATHER_ANALYSIS: 'analysis.weather',
                ASTRONOMICAL_ANALYSIS: 'analysis.astronomical',
                SOCIAL_ANALYSIS: 'analysis.social'
            },

            // Permisos de Operaciones
            OPERATIONS: {
                MONITOR_EVENTS: 'ops.monitor',
                RESPOND_EMERGENCIES: 'ops.respond',
                COORDINATE_TEAMS: 'ops.coordinate',
                MANAGE_RESOURCES: 'ops.manage_resources',
                TRACK_ASSETS: 'ops.track_assets'
            }
        };
    }

    getRolePermissions(roleId, subrole = null) {
        const role = this.roles[roleId];
        if (!role) return [];

        let permissions = [];
        
        // Permisos base según nivel
        permissions = permissions.concat(this.getBasePermissions(role.level));
        
        // Permisos heredados
        if (role.inheritsFrom) {
            role.inheritsFrom.forEach(parentRole => {
                permissions = permissions.concat(this.getRolePermissions(parentRole));
            });
        }

        // Permisos específicos de subrol para especialistas
        if (roleId === 'SPECIALIST' && subrole) {
            permissions = permissions.concat(this.getSpecialistPermissions(subrole));
        }

        // Eliminar duplicados
        return [...new Set(permissions)];
    }

    getBasePermissions(level) {
        const perms = [];
        const p = this.permissions;

        if (level >= 100) { // Ingeniero de Mapa
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD, p.SYSTEM.MANAGE_USERS, p.SYSTEM.VIEW_LOGS,
                p.SYSTEM.SYSTEM_CONFIG, p.SYSTEM.SECURITY_OVERRIDE,
                p.MAP.VIEW_BASIC_MAP, p.MAP.VIEW_ADVANCED_MAP, p.MAP.EDIT_MAP_LAYERS,
                p.MAP.CREATE_MAP, p.MAP.DELETE_MAP, p.MAP.EXPORT_MAP_DATA,
                p.DATA.VIEW_PUBLIC_DATA, p.DATA.VIEW_CLASSIFIED_DATA, p.DATA.VIEW_STRATEGIC_DATA,
                p.DATA.VIEW_OPERATIONAL_DATA, p.DATA.EDIT_DATA, p.DATA.IMPORT_DATA,
                p.DATA.ANALYZE_DATA, p.DATA.EXPORT_DATA,
                p.COMMUNICATION.SEND_ALERTS, p.COMMUNICATION.SECURE_MESSAGING,
                p.COMMUNICATION.BROADCAST, p.COMMUNICATION.VIEW_COMMS,
                p.ANALYSIS.REAL_TIME_ANALYSIS, p.ANALYSIS.PREDICTIVE_ANALYSIS,
                p.ANALYSIS.PATTERN_DETECTION, p.ANALYSIS.THREAT_ANALYSIS,
                p.OPERATIONS.MONITOR_EVENTS, p.OPERATIONS.RESPOND_EMERGENCIES,
                p.OPERATIONS.COORDINATE_TEAMS, p.OPERATIONS.MANAGE_RESOURCES,
                p.OPERATIONS.TRACK_ASSETS
            );
        } else if (level >= 90) { // Administrador
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD, p.SYSTEM.MANAGE_USERS, p.SYSTEM.VIEW_LOGS,
                p.SYSTEM.SYSTEM_CONFIG,
                p.MAP.VIEW_BASIC_MAP, p.MAP.VIEW_ADVANCED_MAP,
                p.DATA.VIEW_PUBLIC_DATA, p.DATA.VIEW_OPERATIONAL_DATA,
                p.DATA.ANALYZE_DATA,
                p.COMMUNICATION.SEND_ALERTS, p.COMMUNICATION.VIEW_COMMS,
                p.ANALYSIS.REAL_TIME_ANALYSIS,
                p.OPERATIONS.MONITOR_EVENTS
            );
        } else if (level >= 80) { // Inteligencia
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD,
                p.MAP.VIEW_ADVANCED_MAP,
                p.DATA.VIEW_CLASSIFIED_DATA, p.DATA.VIEW_STRATEGIC_DATA,
                p.DATA.ANALYZE_DATA, p.DATA.EXPORT_DATA,
                p.COMMUNICATION.SECURE_MESSAGING,
                p.ANALYSIS.REAL_TIME_ANALYSIS, p.ANALYSIS.THREAT_ANALYSIS,
                p.OPERATIONS.MONITOR_EVENTS, p.OPERATIONS.TRACK_ASSETS
            );
        } else if (level >= 70) { // Militar
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD,
                p.MAP.VIEW_ADVANCED_MAP,
                p.DATA.VIEW_STRATEGIC_DATA, p.DATA.VIEW_OPERATIONAL_DATA,
                p.COMMUNICATION.SECURE_MESSAGING,
                p.ANALYSIS.REAL_TIME_ANALYSIS,
                p.OPERATIONS.RESPOND_EMERGENCIES, p.OPERATIONS.COORDINATE_TEAMS,
                p.OPERATIONS.MANAGE_RESOURCES, p.OPERATIONS.TRACK_ASSETS
            );
        } else if (level >= 60) { // Policía
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD,
                p.MAP.VIEW_ADVANCED_MAP,
                p.DATA.VIEW_OPERATIONAL_DATA,
                p.COMMUNICATION.SEND_ALERTS,
                p.ANALYSIS.REAL_TIME_ANALYSIS,
                p.OPERATIONS.RESPOND_EMERGENCIES, p.OPERATIONS.COORDINATE_TEAMS
            );
        } else if (level >= 50) { // Especialista
            perms.push(
                p.SYSTEM.VIEW_DASHBOARD,
                p.MAP.VIEW_BASIC_MAP,
                p.DATA.VIEW_PUBLIC_DATA,
                p.ANALYSIS.REAL_TIME_ANALYSIS
            );
        } else if (level >= 10) { // Público
            perms.push(
                p.MAP.VIEW_BASIC_MAP,
                p.DATA.VIEW_PUBLIC_DATA,
                p.COMMUNICATION.SEND_ALERTS
            );
        }

        return perms;
    }

    getSpecialistPermissions(subrole) {
        const p = this.permissions;
        const specialistPerms = {
            PERIODISTA: [
                p.DATA.VIEW_PUBLIC_DATA,
                p.COMMUNICATION.SEND_ALERTS,
                p.ANALYSIS.REAL_TIME_ANALYSIS,
                'specialist.periodista.report'
            ],
            ASTROLOGO: [
                p.ANALYSIS.PATTERN_DETECTION,
                'specialist.astrologo.chart'
            ],
            ASTRONOMO: [
                p.ANALYSIS.ASTRONOMICAL_ANALYSIS,
                'specialist.astronomo.telescope'
            ],
            METEOROLOGO: [
                p.ANALYSIS.WEATHER_ANALYSIS,
                p.DATA.VIEW_PUBLIC_DATA,
                'specialist.meteorologo.forecast'
            ],
            GEOLOGO: [
                p.ANALYSIS.PATTERN_DETECTION,
                'specialist.geologo.seismic'
            ],
            SOCIOLOGO: [
                p.ANALYSIS.SOCIAL_ANALYSIS,
                'specialist.sociologo.demographic'
            ]
        };

        return specialistPerms[subrole] || [];
    }

    canAccess(roleId, permission, subrole = null) {
        const permissions = this.getRolePermissions(roleId, subrole);
        return permissions.includes(permission);
    }

    getRoleColor(roleId) {
        const colors = {
            MAP_ENGINEER: '#FF6B35',
            ADMINISTRATOR: '#4ECDC4',
            INTELLIGENCE: '#1A535C',
            MILITARY: '#45B7D1',
            POLICE: '#96CEB4',
            SPECIALIST: '#FFEAA7',
            PUBLIC: '#95E1D3'
        };
        return colors[roleId] || '#CCCCCC';
    }

    getRoleIcon(roleId) {
        const icons = {
            MAP_ENGINEER: 'fas fa-cogs',
            ADMINISTRATOR: 'fas fa-user-shield',
            INTELLIGENCE: 'fas fa-user-secret',
            MILITARY: 'fas fa-fighter-jet',
            POLICE: 'fas fa-shield-alt',
            SPECIALIST: 'fas fa-user-graduate',
            PUBLIC: 'fas fa-user'
        };
        return icons[roleId] || 'fas fa-question';
    }

    getSubroleIcon(subrole) {
        const icons = {
            PERIODISTA: 'fas fa-newspaper',
            ASTROLOGO: 'fas fa-star',
            ASTRONOMO: 'fas fa-moon',
            METEOROLOGO: 'fas fa-cloud-sun',
            GEOLOGO: 'fas fa-mountain',
            SOCIOLOGO: 'fas fa-users'
        };
        return icons[subrole] || 'fas fa-user';
    }

    getRoleDescription(roleId) {
        const descriptions = {
            MAP_ENGINEER: 'Control total del sistema y datos geoespaciales',
            ADMINISTRATOR: 'Gestión de usuarios y operaciones del sistema',
            INTELLIGENCE: 'Acceso a inteligencia clasificada y análisis avanzado',
            MILITARY: 'Datos estratégicos y operaciones militares',
            POLICE: 'Seguridad pública y respuesta a emergencias',
            SPECIALIST: 'Análisis especializado en áreas específicas',
            PUBLIC: 'Acceso limitado para información pública de emergencia'
        };
        return descriptions[roleId] || 'Rol no definido';
    }

    // Métodos para UI/UX
    getRoleHierarchyTree() {
        return Object.values(this.roles).sort((a, b) => b.level - a.level).map(role => ({
            id: role.id,
            name: role.name,
            level: role.level,
            color: this.getRoleColor(role.id),
            icon: this.getRoleIcon(role.id),
            description: this.getRoleDescription(role.id),
            inheritsFrom: role.inheritsFrom || [],
            canManage: role.canManage || []
        }));
    }

    getRoleAccessMatrix() {
        const matrix = {};
        const allPermissions = this.getAllPermissionsList();
        
        Object.keys(this.roles).forEach(roleId => {
            matrix[roleId] = {};
            allPermissions.forEach(permission => {
                matrix[roleId][permission] = this.canAccess(roleId, permission);
            });
        });
        
        return matrix;
    }

    getAllPermissionsList() {
        const perms = [];
        Object.values(this.permissions).forEach(category => {
            Object.values(category).forEach(permission => {
                perms.push(permission);
            });
        });
        return perms;
    }

    // Validación de transiciones de rol
    canPromote(fromRoleId, toRoleId) {
        const fromLevel = this.roles[fromRoleId]?.level || 0;
        const toLevel = this.roles[toRoleId]?.level || 0;
        
        // Solo se puede promover a roles de nivel superior
        return toLevel > fromLevel;
    }

    canDemote(fromRoleId, toRoleId) {
        const fromLevel = this.roles[fromRoleId]?.level || 0;
        const toLevel = this.roles[toRoleId]?.level || 0;
        
        // Solo se puede degradar a roles de nivel inferior (con restricciones)
        return toLevel < fromLevel && toLevel >= 10; // Nunca por debajo de público
    }
}

module.exports = new RoleHierarchy();