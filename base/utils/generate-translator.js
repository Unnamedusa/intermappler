// Sistema de Traducción para InterMappler

const fs = require('fs');
const path = require('path');

class TranslationSystem {
    constructor() {
        this.languages = this.loadLanguages();
        this.translations = this.loadTranslations();
        this.defaultLanguage = 'es';
        this.autoDetect = true;
        this.translationCache = new Map();
        this.initializeCache();
    }

    loadLanguages() {
        return [
            { code: 'es', name: 'Español', native_name: 'Español', region: 'ES', rtl: false },
            { code: 'en', name: 'Inglés', native_name: 'English', region: 'US', rtl: false },
            { code: 'fr', name: 'Francés', native_name: 'Français', region: 'FR', rtl: false },
            { code: 'de', name: 'Alemán', native_name: 'Deutsch', region: 'DE', rtl: false },
            { code: 'it', name: 'Italiano', native_name: 'Italiano', region: 'IT', rtl: false },
            { code: 'pt', name: 'Portugués', native_name: 'Português', region: 'PT', rtl: false },
            { code: 'ru', name: 'Ruso', native_name: 'Русский', region: 'RU', rtl: false },
            { code: 'zh', name: 'Chino', native_name: '中文', region: 'CN', rtl: false },
            { code: 'ja', name: 'Japonés', native_name: '日本語', region: 'JP', rtl: false },
            { code: 'ko', name: 'Coreano', native_name: '한국어', region: 'KR', rtl: false },
            { code: 'ar', name: 'Árabe', native_name: 'العربية', region: 'SA', rtl: true },
            { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', region: 'IN', rtl: false },
            { code: 'he', name: 'Hebreo', native_name: 'עברית', region: 'IL', rtl: true },
            { code: 'fa', name: 'Persa', native_name: 'فارسی', region: 'IR', rtl: true }
        ];
    }

    loadTranslations() {
        // Base de datos de traducciones del sistema
        const translations = {
            // === TÉRMINOS DEL SISTEMA ===
            'InterMappler': {
                es: 'InterMappler',
                en: 'InterMappler',
                fr: 'InterMappler',
                de: 'InterMappler',
                it: 'InterMappler',
                pt: 'InterMappler',
                zh: 'InterMappler',
                ja: 'インターマップラー',
                ko: '인터맵플러',
                ar: 'إنترمابِّلر'
            },

            'Sistema de Mapeo Inteligente Global': {
                es: 'Sistema de Mapeo Inteligente Global',
                en: 'Global Intelligent Mapping System',
                fr: 'Système de Cartographie Intelligente Global',
                de: 'Globales Intelligentes Kartierungssystem',
                it: 'Sistema di Mappatura Intelligente Globale',
                pt: 'Sistema Global de Mapeamento Inteligente',
                zh: '全球智能地图系统',
                ja: 'グローバルインテリジェントマッピングシステム',
                ko: '글로벌 지능형 매핑 시스템',
                ar: 'نظام رسم الخرائط الذكي العالمي'
            },

            // === AUTENTICACIÓN ===
            'Iniciar Sesión': {
                es: 'Iniciar Sesión',
                en: 'Login',
                fr: 'Connexion',
                de: 'Anmelden',
                it: 'Accedi',
                pt: 'Entrar',
                zh: '登录',
                ja: 'ログイン',
                ko: '로그인',
                ar: 'تسجيل الدخول'
            },

            'Acceso Público': {
                es: 'Acceso Público',
                en: 'Public Access',
                fr: 'Accès Public',
                de: 'Öffentlicher Zugang',
                it: 'Accesso Pubblico',
                pt: 'Acesso Público',
                zh: '公共访问',
                ja: '公共アクセス',
                ko: '공개 접근',
                ar: 'الوصول العام'
            },

            'Información': {
                es: 'Información',
                en: 'Information',
                fr: 'Information',
                de: 'Information',
                it: 'Informazione',
                pt: 'Informação',
                zh: '信息',
                ja: '情報',
                ko: '정보',
                ar: 'معلومات'
            },

            'Acceso Seguro': {
                es: 'Acceso Seguro',
                en: 'Secure Access',
                fr: 'Accès Sécurisé',
                de: 'Sicherer Zugang',
                it: 'Accesso Sicuro',
                pt: 'Acesso Seguro',
                zh: '安全访问',
                ja: 'セキュアアクセス',
                ko: '보안 접근',
                ar: 'الوصول الآمن'
            },

            'Tipo de Usuario': {
                es: 'Tipo de Usuario',
                en: 'User Type',
                fr: 'Type d\'Utilisateur',
                de: 'Benutzertyp',
                it: 'Tipo di Utente',
                pt: 'Tipo de Usuário',
                zh: '用户类型',
                ja: 'ユーザータイプ',
                ko: '사용자 유형',
                ar: 'نوع المستخدم'
            },

            'Especialización': {
                es: 'Especialización',
                en: 'Specialization',
                fr: 'Spécialisation',
                de: 'Spezialisierung',
                it: 'Specializzazione',
                pt: 'Especialização',
                zh: '专业',
                ja: '専門化',
                ko: '전문화',
                ar: 'التخصص'
            },

            'Usuario': {
                es: 'Usuario',
                en: 'Username',
                fr: 'Utilisateur',
                de: 'Benutzername',
                it: 'Utente',
                pt: 'Usuário',
                zh: '用户名',
                ja: 'ユーザー名',
                ko: '사용자 이름',
                ar: 'اسم المستخدم'
            },

            'Contraseña': {
                es: 'Contraseña',
                en: 'Password',
                fr: 'Mot de passe',
                de: 'Passwort',
                it: 'Password',
                pt: 'Senha',
                zh: '密码',
                ja: 'パスワード',
                ko: '비밀번호',
                ar: 'كلمة المرور'
            },

            'Recordar esta sesión (30 min)': {
                es: 'Recordar esta sesión (30 min)',
                en: 'Remember this session (30 min)',
                fr: 'Se souvenir de cette session (30 min)',
                de: 'Diese Sitzung merken (30 min)',
                it: 'Ricorda questa sessione (30 min)',
                pt: 'Lembrar esta sessão (30 min)',
                zh: '记住此会话（30分钟）',
                ja: 'このセッションを記憶（30分）',
                ko: '이 세션 기억하기 (30분)',
                ar: 'تذكر هذه الجلسة (30 دقيقة)'
            },

            '¿Problemas para acceder?': {
                es: '¿Problemas para acceder?',
                en: 'Having trouble accessing?',
                fr: 'Problèmes d\'accès ?',
                de: 'Probleme beim Zugriff?',
                it: 'Problemi di accesso?',
                pt: 'Problemas para acessar?',
                zh: '访问遇到问题？',
                ja: 'アクセスに問題がありますか？',
                ko: '접속에 문제가 있습니까?',
                ar: 'مشاكل في الوصول؟'
            },

            'Iniciar Sesión Segura': {
                es: 'Iniciar Sesión Segura',
                en: 'Secure Login',
                fr: 'Connexion Sécurisée',
                de: 'Sichere Anmeldung',
                it: 'Accesso Sicuro',
                pt: 'Login Seguro',
                zh: '安全登录',
                ja: 'セキュアログイン',
                ko: '보안 로그인',
                ar: 'تسجيل الدخول الآمن'
            },

            'Acceder al Mapa Público': {
                es: 'Acceder al Mapa Público',
                en: 'Access Public Map',
                fr: 'Accéder à la Carte Publique',
                de: 'Öffentliche Karte Zugreifen',
                it: 'Accedi alla Mappa Pubblica',
                pt: 'Acessar Mapa Público',
                zh: '访问公共地图',
                ja: '公共マップにアクセス',
                ko: '공개 지도 접근',
                ar: 'الوصول إلى الخريطة العامة'
            },

            // === MENSAJES DE ERROR ===
            'Usuario no encontrado': {
                es: 'Usuario no encontrado',
                en: 'User not found',
                fr: 'Utilisateur non trouvé',
                de: 'Benutzer nicht gefunden',
                it: 'Utente non trovato',
                pt: 'Usuário não encontrado',
                zh: '用户未找到',
                ja: 'ユーザーが見つかりません',
                ko: '사용자를 찾을 수 없습니다',
                ar: 'المستخدم غير موجود'
            },

            'Contraseña incorrecta': {
                es: 'Contraseña incorrecta',
                en: 'Incorrect password',
                fr: 'Mot de passe incorrect',
                de: 'Falsches Passwort',
                it: 'Password errata',
                pt: 'Senha incorreta',
                zh: '密码错误',
                ja: 'パスワードが間違っています',
                ko: '잘못된 비밀번호',
                ar: 'كلمة مرور خاطئة'
            },

            'Login exitoso': {
                es: 'Login exitoso',
                en: 'Login successful',
                fr: 'Connexion réussie',
                de: 'Anmeldung erfolgreich',
                it: 'Accesso riuscito',
                pt: 'Login bem-sucedido',
                zh: '登录成功',
                ja: 'ログイン成功',
                ko: '로그인 성공',
                ar: 'تسجيل الدخول ناجح'
            },

            'Usuario inválido. Mínimo 3 caracteres.': {
                es: 'Usuario inválido. Mínimo 3 caracteres.',
                en: 'Invalid username. Minimum 3 characters.',
                fr: 'Nom d\'utilisateur invalide. Minimum 3 caractères.',
                de: 'Ungültiger Benutzername. Mindestens 3 Zeichen.',
                it: 'Nome utente non valido. Minimo 3 caratteri.',
                pt: 'Nome de usuário inválido. Mínimo 3 caracteres.',
                zh: '用户名无效。至少3个字符。',
                ja: '無効なユーザー名。最低3文字必要です。',
                ko: '유효하지 않은 사용자 이름. 최소 3자 이상.',
                ar: 'اسم مستخدم غير صالح. الحد الأدنى 3 أحرف.'
            },

            'Contraseña inválida. Mínimo 8 caracteres.': {
                es: 'Contraseña inválida. Mínimo 8 caracteres.',
                en: 'Invalid password. Minimum 8 characters.',
                fr: 'Mot de passe invalide. Minimum 8 caractères.',
                de: 'Ungültiges Passwort. Mindestens 8 Zeichen.',
                it: 'Password non valida. Minimo 8 caratteri.',
                pt: 'Senha inválida. Mínimo 8 caracteres.',
                zh: '密码无效。至少8个字符。',
                ja: '無効なパスワード。最低8文字必要です。',
                ko: '유효하지 않은 비밀번호. 최소 8자 이상.',
                ar: 'كلمة مرور غير صالحة. الحد الأدنى 8 أحرف.'
            },

            'Por favor, seleccione un tipo de usuario.': {
                es: 'Por favor, seleccione un tipo de usuario.',
                en: 'Please select a user type.',
                fr: 'Veuillez sélectionner un type d\'utilisateur.',
                de: 'Bitte wählen Sie einen Benutzertyp.',
                it: 'Per favore, seleziona un tipo di utente.',
                pt: 'Por favor, selecione um tipo de usuário.',
                zh: '请选择用户类型。',
                ja: 'ユーザータイプを選択してください。',
                ko: '사용자 유형을 선택해 주세요.',
                ar: 'الرجاء اختيار نوع المستخدم.'
            },

            'Por favor, seleccione una especialización.': {
                es: 'Por favor, seleccione una especialización.',
                en: 'Please select a specialization.',
                fr: 'Veuillez sélectionner une spécialisation.',
                de: 'Bitte wählen Sie eine Spezialisierung.',
                it: 'Per favore, seleziona una specializzazione.',
                pt: 'Por favor, selecione uma especialização.',
                zh: '请选择专业。',
                ja: '専門化を選択してください。',
                ko: '전문화를 선택해 주세요.',
                ar: 'الرجاء اختيار التخصص.'
            },

            'Email inválido': {
                es: 'Email inválido',
                en: 'Invalid email',
                fr: 'Email invalide',
                de: 'Ungültige E-Mail',
                it: 'Email non valida',
                pt: 'Email inválido',
                zh: '电子邮件无效',
                ja: '無効なメールアドレス',
                ko: '유효하지 않은 이메일',
                ar: 'بريد إلكتروني غير صالح'
            },

            'Autenticación exitosa': {
                es: 'Autenticación exitosa',
                en: 'Authentication successful',
                fr: 'Authentification réussie',
                de: 'Authentifizierung erfolgreich',
                it: 'Autenticazione riuscita',
                pt: 'Autenticação bem-sucedida',
                zh: '认证成功',
                ja: '認証成功',
                ko: '인증 성공',
                ar: 'المصادقة ناجحة'
            },

            // === ROLES DEL SISTEMA ===
            'Ingeniero de Mapa': {
                es: 'Ingeniero de Mapa',
                en: 'Map Engineer',
                fr: 'Ingénieur Cartographe',
                de: 'Karteningenieur',
                it: 'Ingegnere Cartografico',
                pt: 'Engenheiro de Mapa',
                zh: '地图工程师',
                ja: 'マップエンジニア',
                ko: '맵 엔지니어',
                ar: 'مهندس الخرائط'
            },

            'Administrador': {
                es: 'Administrador',
                en: 'Administrator',
                fr: 'Administrateur',
                de: 'Administrator',
                it: 'Amministratore',
                pt: 'Administrador',
                zh: '管理员',
                ja: '管理者',
                ko: '관리자',
                ar: 'مدير'
            },

            'Agente de Inteligencia': {
                es: 'Agente de Inteligencia',
                en: 'Intelligence Agent',
                fr: 'Agent de Renseignement',
                de: 'Geheimdienstagent',
                it: 'Agente di Intelligence',
                pt: 'Agente de Inteligência',
                zh: '情报特工',
                ja: 'インテリジェンスエージェント',
                ko: '정보 요원',
                ar: 'عميل مخابرات'
            },

            'Personal Militar': {
                es: 'Personal Militar',
                en: 'Military Personnel',
                fr: 'Personnel Militaire',
                de: 'Militärpersonal',
                it: 'Personale Militare',
                pt: 'Pessoal Militar',
                zh: '军事人员',
                ja: '軍事要員',
                ko: '군사 인원',
                ar: 'الأفراد العسكريون'
            },

            'Agente de Policía': {
                es: 'Agente de Policía',
                en: 'Police Officer',
                fr: 'Agent de Police',
                de: 'Polizeibeamter',
                it: 'Agente di Polizia',
                pt: 'Agente de Polícia',
                zh: '警察',
                ja: '警察官',
                ko: '경찰관',
                ar: 'ضابط شرطة'
            },

            'Especialista': {
                es: 'Especialista',
                en: 'Specialist',
                fr: 'Spécialiste',
                de: 'Spezialist',
                it: 'Specialista',
                pt: 'Especialista',
                zh: '专家',
                ja: 'スペシャリスト',
                ko: '전문가',
                ar: 'متخصص'
            },

            'Usuario Público': {
                es: 'Usuario Público',
                en: 'Public User',
                fr: 'Utilisateur Public',
                de: 'Öffentlicher Benutzer',
                it: 'Utente Pubblico',
                pt: 'Usuário Público',
                zh: '公共用户',
                ja: '一般ユーザー',
                ko: '공개 사용자',
                ar: 'مستخدم عام'
            },

            // === SUBROLES ESPECIALISTAS ===
            'Periodista': {
                es: 'Periodista',
                en: 'Journalist',
                fr: 'Journaliste',
                de: 'Journalist',
                it: 'Giornalista',
                pt: 'Jornalista',
                zh: '记者',
                ja: 'ジャーナリスト',
                ko: '기자',
                ar: 'صحفي'
            },

            'Astrólogo': {
                es: 'Astrólogo',
                en: 'Astrologer',
                fr: 'Astrologue',
                de: 'Astrologe',
                it: 'Astrologo',
                pt: 'Astrólogo',
                zh: '占星家',
                ja: '占星術師',
                ko: '점성가',
                ar: 'منجم'
            },

            'Astrónomo': {
                es: 'Astrónomo',
                en: 'Astronomer',
                fr: 'Astronome',
                de: 'Astronom',
                it: 'Astronomo',
                pt: 'Astrônomo',
                zh: '天文学家',
                ja: '天文学者',
                ko: '천문학자',
                ar: 'عالم فلك'
            },

            'Meteorólogo': {
                es: 'Meteorólogo',
                en: 'Meteorologist',
                fr: 'Météorologue',
                de: 'Meteorologe',
                it: 'Meteorologo',
                pt: 'Meteorologista',
                zh: '气象学家',
                ja: '気象学者',
                ko: '기상학자',
                ar: 'عالم أرصاد جوية'
            },

            'Geólogo': {
                es: 'Geólogo',
                en: 'Geologist',
                fr: 'Géologue',
                de: 'Geologe',
                it: 'Geologo',
                pt: 'Geólogo',
                zh: '地质学家',
                ja: '地質学者',
                ko: '지질학자',
                ar: 'جيولوجي'
            },

            'Sociólogo': {
                es: 'Sociólogo',
                en: 'Sociologist',
                fr: 'Sociologue',
                de: 'Soziologe',
                it: 'Sociologo',
                pt: 'Sociólogo',
                zh: '社会学家',
                ja: '社会学者',
                ko: '사회학자',
                ar: 'عالم اجتماع'
            },

            // === ACCESO PÚBLICO ===
            'Mapa en tiempo real con información de emergencia para salvar vidas': {
                es: 'Mapa en tiempo real con información de emergencia para salvar vidas',
                en: 'Real-time map with emergency information to save lives',
                fr: 'Carte en temps réel avec informations d\'urgence pour sauver des vies',
                de: 'Echtzeit-Karte mit Notfallinformationen zur Lebensrettung',
                it: 'Mappa in tempo reale con informazioni di emergenza per salvare vite',
                pt: 'Mapa em tempo real com informações de emergência para salvar vidas',
                zh: '实时地图，包含紧急信息以拯救生命',
                ja: '命を救うための緊急情報付きリアルタイムマップ',
                ko: '생명을 구하기 위한 비상 정보가 포함된 실시간 지도',
                ar: 'خريطة في الوقت الفعلي مع معلومات الطوارئ لإنقاذ الأرواح'
            },

            'Alertas de Emergencia': {
                es: 'Alertas de Emergencia',
                en: 'Emergency Alerts',
                fr: 'Alertes d\'Urgence',
                de: 'Notfallwarnungen',
                it: 'Allarmi di Emergenza',
                pt: 'Alertas de Emergencia',
                zh: '紧急警报',
                ja: '緊急アラート',
                ko: '비상 경보',
                ar: 'تنبيهات الطوارئ'
            },

            'Información en tiempo real sobre desastres naturales': {
                es: 'Información en tiempo real sobre desastres naturales',
                en: 'Real-time information about natural disasters',
                fr: 'Informations en temps réel sur les catastrophes naturelles',
                de: 'Echtzeit-Informationen über Naturkatastrophen',
                it: 'Informazioni in tempo reale sui disastri naturali',
                pt: 'Informações em tempo real sobre desastres naturais',
                zh: '关于自然灾害的实时信息',
                ja: '自然災害に関するリアルタイム情報',
                ko: '자연 재해에 대한 실시간 정보',
                ar: 'معلومات في الوقت الفعلي عن الكوارث الطبيعية'
            },

            'Pronóstico Meteorológico': {
                es: 'Pronóstico Meteorológico',
                en: 'Weather Forecast',
                fr: 'Prévisions Météorologiques',
                de: 'Wettervorhersage',
                it: 'Previsioni Meteorologiche',
                pt: 'Previsão do Tempo',
                zh: '天气预报',
                ja: '天気予報',
                ko: '날씨 예보',
                ar: 'توقعات الطقس'
            },

            'Datos climáticos actualizados cada 15 minutos': {
                es: 'Datos climáticos actualizados cada 15 minutos',
                en: 'Climate data updated every 15 minutes',
                fr: 'Données climatiques mises à jour toutes les 15 minutes',
                de: 'Klimadaten alle 15 Minuten aktualisiert',
                it: 'Dati climatici aggiornati ogni 15 minuti',
                pt: 'Dados climáticos atualizados a cada 15 minutos',
                zh: '每15分钟更新的气候数据',
                ja: '15分ごとに更新される気候データ',
                ko: '15분마다 업데이트되는 기후 데이터',
                ar: 'بيانات المناخ المحدثة كل 15 دقيقة'
            },

            'Servicios de Emergencia': {
                es: 'Servicios de Emergencia',
                en: 'Emergency Services',
                fr: 'Services d\'Urgence',
                de: 'Notdienste',
                it: 'Servizi di Emergenza',
                pt: 'Serviços de Emergencia',
                zh: '紧急服务',
                ja: '緊急サービス',
                ko: '응급 서비스',
                ar: 'خدمات الطوارئ'
            },

            'Localización de hospitales y centros de ayuda': {
                es: 'Localización de hospitales y centros de ayuda',
                en: 'Location of hospitals and help centers',
                fr: 'Localisation des hôpitaux et centres d\'aide',
                de: 'Standorte von Krankenhäusern und Hilfszentren',
                it: 'Localizzazione di ospedali e centri di aiuto',
                pt: 'Localização de hospitais e centros de ajuda',
                zh: '医院和帮助中心的位置',
                ja: '病院とヘルプセンターの位置',
                ko: '병원 및 도움 센터 위치',
                ar: 'موقع المستشفيات ومراكز المساعدة'
            },

            'El acceso público no requiere registro. Los datos son limitados para protección de la privacidad.': {
                es: 'El acceso público no requiere registro. Los datos son limitados para protección de la privacidad.',
                en: 'Public access does not require registration. Data is limited for privacy protection.',
                fr: 'L\'accès public ne nécessite pas d\'enregistrement. Les données sont limitées pour la protection de la vie privée.',
                de: 'Öffentlicher Zugang erfordert keine Registrierung. Daten sind für den Datenschutz begrenzt.',
                it: 'L\'accesso pubblico non richiede registrazione. I dati sono limitati per la protezione della privacy.',
                pt: 'O acesso público não requer registro. Os dados são limitados para proteção da privacidade.',
                zh: '公共访问无需注册。数据有限以保护隐私。',
                ja: '公共アクセスは登録不要です。データはプライバシー保護のため制限されています。',
                ko: '공개 접근은 등록이 필요하지 않습니다. 데이터는 개인정보 보호를 위해 제한됩니다.',
                ar: 'الوصول العام لا يتطلب التسجيل. البيانات محدودة لحماية الخصوصية.'
            },

            // === INFORMACIÓN DEL SISTEMA ===
            'Sistema de Mapeo Inteligente': {
                es: 'Sistema de Mapeo Inteligente',
                en: 'Intelligent Mapping System',
                fr: 'Système de Cartographie Intelligente',
                de: 'Intelligentes Kartierungssystem',
                it: 'Sistema di Mappatura Intelligente',
                pt: 'Sistema de Mapeamento Inteligente',
                zh: '智能地图系统',
                ja: 'インテリジェントマッピングシステム',
                ko: '지능형 매핑 시스템',
                ar: 'نظام رسم الخرائط الذكي'
            },

            'InterMappler es una plataforma avanzada de mapeo en tiempo real que proporciona diferentes niveles de acceso según el rol del usuario, desde información pública de emergencia hasta datos estratégicos clasificados.': {
                es: 'InterMappler es una plataforma avanzada de mapeo en tiempo real que proporciona diferentes niveles de acceso según el rol del usuario, desde información pública de emergencia hasta datos estratégicos clasificados.',
                en: 'InterMappler is an advanced real-time mapping platform that provides different access levels according to user role, from public emergency information to classified strategic data.',
                fr: 'InterMappler est une plateforme de cartographie en temps réel avancée qui fournit différents niveaux d\'accès selon le rôle de l\'utilisateur, des informations d\'urgence publiques aux données stratégiques classifiées.',
                de: 'InterMappler ist eine fortschrittliche Echtzeit-Kartierungsplattform, die je nach Benutzerrolle unterschiedliche Zugriffsebenen bietet, von öffentlichen Notfallinformationen bis zu klassifizierten strategischen Daten.',
                it: 'InterMappler è una piattaforma di mappatura in tempo reale avanzata che fornisce diversi livelli di accesso in base al ruolo dell\'utente, dalle informazioni di emergenza pubbliche ai dati strategici classificati.',
                pt: 'InterMappler é uma plataforma avançada de mapeamento em tempo real que fornece diferentes níveis de acesso de acordo com a função do usuário, desde informações públicas de emergência até dados estratégicos classificados.',
                zh: 'InterMappler 是一个先进的实时地图平台，根据用户角色提供不同级别的访问权限，从公共紧急信息到机密战略数据。',
                ja: 'InterMapplerは、公開緊急情報から機密戦略データまで、ユーザーの役割に応じた異なるアクセスレベルを提供する高度なリアルタイムマッピングプラットフォームです。',
                ko: 'InterMappler는 공개 비상 정보에서 기밀 전략 데이터에 이르기까지 사용자 역할에 따라 다양한 접근 수준을 제공하는 고급 실시간 매핑 플랫폼입니다.',
                ar: 'إنترمابِّلر هو منصة رسم خرائط متقدمة في الوقت الفعلي توفر مستويات وصول مختلفة وفقًا لدور المستخدم، من معلومات الطوارئ العامة إلى البيانات الاستراتيجية المصنفة.'
            },

            'Jerarquía de Roles': {
                es: 'Jerarquía de Roles',
                en: 'Role Hierarchy',
                fr: 'Hiérarchie des Rôles',
                de: 'Rollenhierarchie',
                it: 'Gerarchia dei Ruoli',
                pt: 'Hierarquia de Funções',
                zh: '角色层次结构',
                ja: '役割階層',
                ko: '역할 계층 구조',
                ar: 'التسلسل الهرمي للأدوار'
            },

            'Características de Seguridad': {
                es: 'Características de Seguridad',
                en: 'Security Features',
                fr: 'Caractéristiques de Sécurité',
                de: 'Sicherheitsfunktionen',
                it: 'Caratteristiche di Sicurezza',
                pt: 'Características de Segurança',
                zh: '安全特性',
                ja: 'セキュリティ機能',
                ko: '보안 기능',
                ar: 'ميزات الأمان'
            },

            // === FOOTER ===
            'Seguridad': {
                es: 'Seguridad',
                en: 'Security',
                fr: 'Sécurité',
                de: 'Sicherheit',
                it: 'Sicurezza',
                pt: 'Segurança',
                zh: '安全',
                ja: 'セキュリティ',
                ko: '보안',
                ar: 'الأمان'
            },

            'Todas las conexiones están encriptadas con SSL/TLS 1.3': {
                es: 'Todas las conexiones están encriptadas con SSL/TLS 1.3',
                en: 'All connections are encrypted with SSL/TLS 1.3',
                fr: 'Toutes les connexions sont cryptées avec SSL/TLS 1.3',
                de: 'Alle Verbindungen sind mit SSL/TLS 1.3 verschlüsselt',
                it: 'Tutte le connessioni sono crittografate con SSL/TLS 1.3',
                pt: 'Todas as conexões são criptografadas com SSL/TLS 1.3',
                zh: '所有连接均使用 SSL/TLS 1.3 加密',
                ja: 'すべての接続はSSL/TLS 1.3で暗号化されています',
                ko: '모든 연결은 SSL/TLS 1.3으로 암호화됩니다',
                ar: 'جميع الاتصالات مشفرة باستخدام SSL/TLS 1.3'
            },

            'Disponibilidad': {
                es: 'Disponibilidad',
                en: 'Availability',
                fr: 'Disponibilité',
                de: 'Verfügbarkeit',
                it: 'Disponibilità',
                pt: 'Disponibilidade',
                zh: '可用性',
                ja: '可用性',
                ko: '가용성',
                ar: 'التوفر'
            },

            'Sistema operativo 24/7 con 99.9% uptime': {
                es: 'Sistema operativo 24/7 con 99.9% uptime',
                en: '24/7 operational system with 99.9% uptime',
                fr: 'Système opérationnel 24/7 avec 99.9% de disponibilité',
                de: '24/7 Betriebssystem mit 99,9% Verfügbarkeit',
                it: 'Sistema operativo 24/7 con disponibilità del 99,9%',
                pt: 'Sistema operacional 24/7 com 99.9% de disponibilidade',
                zh: '24/7 运行系统，正常运行时间 99.9%',
                ja: '99.9%の稼働率を誇る24/7運用システム',
                ko: '99.9% 가동 시간을 자랑하는 24/7 운영 시스템',
                ar: 'نظام تشغيلي على مدار الساعة مع وقت تشغيل 99.9%'
            },

            'Soporte': {
                es: 'Soporte',
                en: 'Support',
                fr: 'Support',
                de: 'Support',
                it: 'Supporto',
                pt: 'Suporte',
                zh: '支持',
                ja: 'サポート',
                ko: '지원',
                ar: 'الدعم'
            },

            'Contacto: support@intermappler.org': {
                es: 'Contacto: support@intermappler.org',
                en: 'Contact: support@intermappler.org',
                fr: 'Contact: support@intermappler.org',
                de: 'Kontakt: support@intermappler.org',
                it: 'Contatto: support@intermappler.org',
                pt: 'Contato: support@intermappler.org',
                zh: '联系: support@intermappler.org',
                ja: '連絡先: support@intermappler.org',
                ko: '연락처: support@intermappler.org',
                ar: 'الاتصال: support@intermappler.org'
            },

            // === ESTADOS Y MENSAJES ===
            'activo': {
                es: 'activo',
                en: 'active',
                fr: 'actif',
                de: 'aktiv',
                it: 'attivo',
                pt: 'ativo',
                zh: '活跃',
                ja: 'アクティブ',
                ko: '활성',
                ar: 'نشط'
            },

            'inactivo': {
                es: 'inactivo',
                en: 'inactive',
                fr: 'inactif',
                de: 'inaktiv',
                it: 'inattivo',
                pt: 'inativo',
                zh: '不活跃',
                ja: '非アクティブ',
                ko: '비활성',
                ar: 'غير نشط'
            },

            'protegido': {
                es: 'protegido',
                en: 'protected',
                fr: 'protégé',
                de: 'geschützt',
                it: 'protetto',
                pt: 'protegido',
                zh: '受保护',
                ja: '保護済み',
                ko: '보호됨',
                ar: 'محمي'
            },

            'Error interno del sistema': {
                es: 'Error interno del sistema',
                en: 'Internal system error',
                fr: 'Erreur interne du système',
                de: 'Interner Systemfehler',
                it: 'Errore interno del sistema',
                pt: 'Erro interno do sistema',
                zh: '内部系统错误',
                ja: '内部システムエラー',
                ko: '내부 시스템 오류',
                ar: 'خطأ داخلي في النظام'
            },

            // === TÉRMINOS DE SEGURIDAD ===
            '3-capas-activa': {
                es: '3-capas-activa',
                en: '3-layers-active',
                fr: '3-couches-actives',
                de: '3-Schichten-aktiv',
                it: '3-livelli-attivi',
                pt: '3-camadas-ativas',
                zh: '3层激活',
                ja: '3層アクティブ',
                ko: '3계층 활성화',
                ar: '3-طبقات-نشطة'
            },

            'alto': {
                es: 'alto',
                en: 'high',
                fr: 'élevé',
                de: 'hoch',
                it: 'alto',
                pt: 'alto',
                zh: '高',
                ja: '高い',
                ko: '높음',
                ar: 'عالي'
            },

            'máxima': {
                es: 'máxima',
                en: 'maximum',
                fr: 'maximale',
                de: 'maximal',
                it: 'massima',
                pt: 'máxima',
                zh: '最大',
                ja: '最大',
                ko: '최대',
                ar: 'قصوى'
            },

            // === FORTALEZA DE CONTRASEÑA ===
            'Fuerte': {
                es: 'Fuerte',
                en: 'Strong',
                fr: 'Fort',
                de: 'Stark',
                it: 'Forte',
                pt: 'Forte',
                zh: '强',
                ja: '強い',
                ko: '강함',
                ar: 'قوي'
            },

            'Moderada': {
                es: 'Moderada',
                en: 'Moderate',
                fr: 'Modéré',
                de: 'Mäßig',
                it: 'Moderata',
                pt: 'Moderada',
                zh: '中等',
                ja: '中程度',
                ko: '보통',
                ar: 'معتدل'
            },

            'Débil': {
                es: 'Débil',
                en: 'Weak',
                fr: 'Faible',
                de: 'Schwach',
                it: 'Debole',
                pt: 'Fraca',
                zh: '弱',
                ja: '弱い',
                ko: '약함',
                ar: 'ضعيف'
            },

            'Muy débil': {
                es: 'Muy débil',
                en: 'Very weak',
                fr: 'Très faible',
                de: 'Sehr schwach',
                it: 'Molto debole',
                pt: 'Muito fraca',
                zh: '非常弱',
                ja: '非常に弱い',
                ko: '매우 약함',
                ar: 'ضعيف جدًا'
            },

            // === SELECTORES ===
            '-- Seleccione su rol --': {
                es: '-- Seleccione su rol --',
                en: '-- Select your role --',
                fr: '-- Sélectionnez votre rôle --',
                de: '-- Wählen Sie Ihre Rolle --',
                it: '-- Seleziona il tuo ruolo --',
                pt: '-- Selecione seu papel --',
                zh: '-- 选择您的角色 --',
                ja: '-- 役割を選択 --',
                ko: '-- 역할을 선택하세요 --',
                ar: '-- اختر دورك --'
            },

            '-- Seleccione especialización --': {
                es: '-- Seleccione especialización --',
                en: '-- Select specialization --',
                fr: '-- Sélectionnez spécialisation --',
                de: '-- Spezialisierung wählen --',
                it: '-- Seleziona specializzazione --',
                pt: '-- Selecione especialização --',
                zh: '-- 选择专业 --',
                ja: '-- 専門化を選択 --',
                ko: '-- 전문화 선택 --',
                ar: '-- اختر التخصص --'
            },

            // === PLACEHOLDERS ===
            'Ingrese su usuario': {
                es: 'Ingrese su usuario',
                en: 'Enter your username',
                fr: 'Entrez votre nom d\'utilisateur',
                de: 'Geben Sie Ihren Benutzernamen ein',
                it: 'Inserisci il tuo nome utente',
                pt: 'Digite seu nome de usuário',
                zh: '输入您的用户名',
                ja: 'ユーザー名を入力',
                ko: '사용자 이름을 입력하세요',
                ar: 'أدخل اسم المستخدم الخاص بك'
            },

            'Ingrese su contraseña': {
                es: 'Ingrese su contraseña',
                en: 'Enter your password',
                fr: 'Entrez votre mot de passe',
                de: 'Geben Sie Ihr Passwort ein',
                it: 'Inserisci la tua password',
                pt: 'Digite sua senha',
                zh: '输入您的密码',
                ja: 'パスワードを入力',
                ko: '비밀번호를 입력하세요',
                ar: 'أدخل كلمة المرور الخاصة بك'
            },

            'Email registrado': {
                es: 'Email registrado',
                en: 'Registered email',
                fr: 'Email enregistré',
                de: 'Registrierte E-Mail',
                it: 'Email registrata',
                pt: 'Email registrado',
                zh: '注册邮箱',
                ja: '登録済みメール',
                ko: '등록된 이메일',
                ar: 'البريد الإلكتروني المسجل'
            },

            'ID del dato': {
                es: 'ID del dato',
                en: 'Data ID',
                fr: 'ID des données',
                de: 'Daten-ID',
                it: 'ID dati',
                pt: 'ID do dado',
                zh: '数据ID',
                ja: 'データID',
                ko: '데이터 ID',
                ar: 'معرّف البيانات'
            },

            'ID a eliminar': {
                es: 'ID a eliminar',
                en: 'ID to delete',
                fr: 'ID à supprimer',
                de: 'Zu löschende ID',
                it: 'ID da eliminare',
                pt: 'ID para excluir',
                zh: '要删除的ID',
                ja: '削除するID',
                ko: '삭제할 ID',
                ar: 'معرّف للحذف'
            },

            'Tu nombre': {
                es: 'Tu nombre',
                en: 'Your name',
                fr: 'Votre nom',
                de: 'Ihr Name',
                it: 'Il tuo nome',
                pt: 'Seu nome',
                zh: '您的名字',
                ja: 'あなたの名前',
                ko: '당신의 이름',
                ar: 'اسمك'
            },

            // === DEMO ===
            'Demo': {
                es: 'Demo',
                en: 'Demo',
                fr: 'Démo',
                de: 'Demo',
                it: 'Demo',
                pt: 'Demo',
                zh: '演示',
                ja: 'デモ',
                ko: '데모',
                ar: 'عرض'
            },

            // === NIVELES ===
            'Lvl': {
                es: 'Nvl',
                en: 'Lvl',
                fr: 'Niv',
                de: 'Stufe',
                it: 'Liv',
                pt: 'Nvl',
                zh: '等级',
                ja: 'レベル',
                ko: '레벨',
                ar: 'مستوى'
            }
        };

        return translations;
    }

    initializeCache() {
        // Precargar caché con traducciones frecuentes
        for (const [key, translations] of Object.entries(this.translations)) {
            for (const [lang, translation] of Object.entries(translations)) {
                const cacheKey = `${key}_${lang}`;
                this.translationCache.set(cacheKey, translation);
            }
        }
    }

    translate(text, targetLanguage, sourceLanguage = 'auto') {
        if (!text || typeof text !== 'string') return text;
        
        // Validar idioma objetivo
        targetLanguage = this.validateLanguage(targetLanguage);
        
        // Si el idioma objetivo es el mismo que el fuente (si se especificó)
        if (sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
            return text;
        }
        
        // Verificar caché primero
        const cacheKey = `${text}_${targetLanguage}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }
        
        // Buscar traducción exacta en la base de datos
        const translation = this.translations[text];
        if (translation && translation[targetLanguage]) {
            this.translationCache.set(cacheKey, translation[targetLanguage]);
            return translation[targetLanguage];
        }
        
        // Buscar traducción insensible a mayúsculas/minúsculas
        const normalizedText = this.normalizeText(text);
        for (const [key, translations] of Object.entries(this.translations)) {
            if (this.normalizeText(key) === normalizedText && translations[targetLanguage]) {
                this.translationCache.set(cacheKey, translations[targetLanguage]);
                return translations[targetLanguage];
            }
        }
        
        // Si no hay traducción específica, intentar traducción automática
        if (targetLanguage !== this.defaultLanguage) {
            const autoTranslated = this.autoTranslate(text, targetLanguage);
            this.translationCache.set(cacheKey, autoTranslated);
            return autoTranslated;
        }
        
        // Devolver texto original si no hay traducción
        return text;
    }

    translateObject(obj, targetLanguage, sourceLanguage = 'auto') {
        if (!obj || typeof obj !== 'object') return obj;
        
        targetLanguage = this.validateLanguage(targetLanguage);
        
        // Clonar el objeto para no modificar el original
        const translated = Array.isArray(obj) ? [] : {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // No traducir keys específicas
                if (this.shouldSkipKey(key)) {
                    translated[key] = value;
                    continue;
                }
                
                if (typeof value === 'string') {
                    // Traducir strings
                    translated[key] = this.translate(value, targetLanguage, sourceLanguage);
                } else if (typeof value === 'object' && value !== null) {
                    // Recursividad para objetos anidados
                    translated[key] = this.translateObject(value, targetLanguage, sourceLanguage);
                } else {
                    // Mantener otros tipos de datos
                    translated[key] = value;
                }
            }
        }
        
        // Añadir metadata de traducción si es un objeto (no array)
        if (!Array.isArray(translated) && !translated._translation) {
            translated._translation = {
                source_language: sourceLanguage === 'auto' ? this.detectLanguage(JSON.stringify(obj)).language : sourceLanguage,
                target_language: targetLanguage,
                auto_translated: this.hasAutoTranslated(obj, translated),
                timestamp: new Date().toISOString()
            };
        }
        
        return translated;
    }

    autoTranslate(text, targetLanguage) {
        // Simulación de traducción automática
        // En producción se integraría con Google Translate, DeepL, etc.
        
        const translationMap = {
            // Mapeo básico para demostración
            'hello': {
                es: 'hola',
                fr: 'bonjour',
                de: 'hallo',
                it: 'ciao',
                pt: 'olá',
                zh: '你好',
                ja: 'こんにちは',
                ko: '안녕하세요',
                ar: 'مرحبا'
            },
            'world': {
                es: 'mundo',
                fr: 'monde',
                de: 'welt',
                it: 'mondo',
                pt: 'mundo',
                zh: '世界',
                ja: '世界',
                ko: '세계',
                ar: 'عالم'
            },
            'map': {
                es: 'mapa',
                fr: 'carte',
                de: 'karte',
                it: 'mappa',
                pt: 'mapa',
                zh: '地图',
                ja: 'マップ',
                ko: '지도',
                ar: 'خريطة'
            },
            'system': {
                es: 'sistema',
                fr: 'système',
                de: 'system',
                it: 'sistema',
                pt: 'sistema',
                zh: '系统',
                ja: 'システム',
                ko: '시스템',
                ar: 'نظام'
            },
            'data': {
                es: 'datos',
                fr: 'données',
                de: 'daten',
                it: 'dati',
                pt: 'dados',
                zh: '数据',
                ja: 'データ',
                ko: '데이터',
                ar: 'بيانات'
            },
            'secure': {
                es: 'seguro',
                fr: 'sécurisé',
                de: 'sicher',
                it: 'sicuro',
                pt: 'seguro',
                zh: '安全',
                ja: '安全',
                ko: '안전한',
                ar: 'آمن'
            },
            'access': {
                es: 'acceso',
                fr: 'accès',
                de: 'zugriff',
                it: 'accesso',
                pt: 'acesso',
                zh: '访问',
                ja: 'アクセス',
                ko: '접근',
                ar: 'وصول'
            }
        };
        
        // Convertir a minúsculas para búsqueda
        const lowerText = text.toLowerCase();
        
        // Buscar palabras individuales
        const words = lowerText.split(' ');
        const translatedWords = words.map(word => {
            if (translationMap[word] && translationMap[word][targetLanguage]) {
                return translationMap[word][targetLanguage];
            }
            return word;
        });
        
        return translatedWords.join(' ');
    }

    detectLanguage(text) {
        if (!text || typeof text !== 'string') {
            return { language: this.defaultLanguage, confidence: 0, iso_code: this.defaultLanguage };
        }
        
        // Detección simple de idioma basada en caracteres comunes
        const patterns = {
            en: /[a-z]/gi,
            es: /[áéíóúñ]/gi,
            fr: /[àâçéèêëîïôûùüÿ]/gi,
            de: /[äöüß]/gi,
            it: /[àèéìíîòóùú]/gi,
            pt: /[ãõáéíóúâêôç]/gi,
            ru: /[а-я]/gi,
            zh: /[\u4e00-\u9fff]/g,
            ja: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g,
            ko: /[\uac00-\ud7af]/g,
            ar: /[\u0600-\u06ff]/g,
            he: /[\u0590-\u05ff]/g,
            fa: /[\u0600-\u06ff]/g
        };
        
        let maxScore = 0;
        let detectedLang = this.defaultLanguage;
        
        for (const [lang, pattern] of Object.entries(patterns)) {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxScore) {
                maxScore = matches;
                detectedLang = lang;
            }
        }
        
        // Si no se detectó ningún patrón específico, usar inglés o español
        if (maxScore === 0) {
            // Verificar si el texto parece inglés (muchas palabras comunes en inglés)
            const englishWords = ['the', 'and', 'you', 'that', 'have', 'for', 'not', 'with', 'this', 'but'];
            const englishCount = englishWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            
            if (englishCount > 2) {
                detectedLang = 'en';
            } else {
                detectedLang = this.defaultLanguage;
            }
        }
        
        const confidence = Math.min(maxScore / text.length * 100, 100) || 10;
        
        return {
            language: detectedLang,
            confidence: confidence,
            iso_code: detectedLang,
            detected: maxScore > 0
        };
    }

    validateLanguage(lang) {
        if (!lang) return this.defaultLanguage;
        
        const validLanguages = this.languages.map(l => l.code);
        const normalizedLang = lang.toLowerCase().split('-')[0]; // Tomar solo la parte principal (es-ES -> es)
        
        return validLanguages.includes(normalizedLang) ? normalizedLang : this.defaultLanguage;
    }

    getAvailableLanguages() {
        return this.languages;
    }

    getLanguageName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.name : 'Unknown';
    }

    getNativeName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.native_name : 'Unknown';
    }

    getRegion(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.region : 'Unknown';
    }

    isRTL(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.rtl : false;
    }

    shouldSkipKey(key) {
        // Keys que no deben traducirse
        const skipKeys = [
            'id', '_id', 'timestamp', 'createdAt', 'updatedAt', 'created_at', 'updated_at',
            'email', 'username', 'password', 'token', 'sessionId', 'session_id',
            'ip', 'ip_address', 'coordinates', 'url', 'path', 'method',
            'code', 'error_code', 'status_code', 'version',
            'hash', 'encrypted', 'signature', 'key', 'secret',
            'latitude', 'longitude', 'lat', 'lng', 'coord',
            'phone', 'telephone', 'mobile', 'cellphone',
            'address', 'city', 'state', 'country', 'zip', 'postal_code',
            'file', 'filename', 'path', 'directory', 'folder',
            'width', 'height', 'size', 'dimensions',
            'price', 'cost', 'amount', 'quantity', 'total',
            'percentage', 'ratio', 'rate', 'speed'
        ];
        
        return skipKeys.includes(key) || 
               key.startsWith('_') || 
               /^[0-9]+$/.test(key) ||
               key.includes('_id') ||
               key.includes('url') ||
               key.includes('api') ||
               key.includes('uid') ||
               key.includes('guid') ||
               key.includes('uuid');
    }

    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    hasAutoTranslated(original, translated) {
        // Verificar si algún texto fue traducido automáticamente
        const checkObject = (orig, trans) => {
            for (const key in orig) {
                if (orig.hasOwnProperty(key) && trans.hasOwnProperty(key)) {
                    const origValue = orig[key];
                    const transValue = trans[key];
                    
                    if (typeof origValue === 'string' && typeof transValue === 'string') {
                        if (origValue !== transValue && 
                            this.normalizeText(origValue) !== this.normalizeText(transValue)) {
                            // Si el texto cambió y no es una traducción conocida
                            if (!this.translations[origValue] || !this.translations[origValue][this.detectLanguage(transValue).language]) {
                                return true;
                            }
                        }
                    } else if (typeof origValue === 'object' && typeof transValue === 'object') {
                        if (checkObject(origValue, transValue)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        
        return checkObject(original, translated);
    }

    countTranslatedItems(original, translated) {
        let count = 0;
        
        const countStrings = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    
                    if (typeof value === 'string' && !this.shouldSkipKey(key)) {
                        count++;
                    } else if (typeof value === 'object' && value !== null) {
                        countStrings(value);
                    }
                }
            }
        };
        
        countStrings(original);
        return count;
    }

    // Métodos para añadir traducciones dinámicamente
    addTranslation(key, translations) {
        if (!this.translations[key]) {
            this.translations[key] = {};
        }
        
        Object.assign(this.translations[key], translations);
        
        // Actualizar caché
        for (const [lang, translation] of Object.entries(translations)) {
            const cacheKey = `${key}_${lang}`;
            this.translationCache.set(cacheKey, translation);
        }
        
        return true;
    }

    removeTranslation(key, language = null) {
        if (!language) {
            delete this.translations[key];
            // Limpiar caché
            for (const lang of this.languages.map(l => l.code)) {
                this.translationCache.delete(`${key}_${lang}`);
            }
        } else if (this.translations[key]) {
            delete this.translations[key][language];
            this.translationCache.delete(`${key}_${language}`);
        }
        return true;
    }

    // Estadísticas de traducción
    getTranslationStats() {
        const totalKeys = Object.keys(this.translations).length;
        const languageCounts = {};
        
        for (const key in this.translations) {
            for (const lang in this.translations[key]) {
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            }
        }
        
        return {
            total_translations: totalKeys,
            languages: languageCounts,
            coverage: Object.keys(languageCounts).length,
            default_language: this.defaultLanguage,
            cache_size: this.translationCache.size,
            supported_languages: this.languages.length
        };
    }

    // Cargar traducciones desde archivo
    loadTranslationsFromFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            if (fs.existsSync(absolutePath)) {
                const fileContent = fs.readFileSync(absolutePath, 'utf8');
                const translations = JSON.parse(fileContent);
                
                // Fusionar con las traducciones existentes
                Object.assign(this.translations, translations);
                
                // Actualizar caché
                for (const [key, langTranslations] of Object.entries(translations)) {
                    for (const [lang, translation] of Object.entries(langTranslations)) {
                        const cacheKey = `${key}_${lang}`;
                        this.translationCache.set(cacheKey, translation);
                    }
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error cargando traducciones desde archivo:', error);
        }
        return false;
    }

    // Guardar traducciones a archivo
    saveTranslationsToFile(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            const dir = path.dirname(absolutePath);
            
            // Crear directorio si no existe
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(absolutePath, JSON.stringify(this.translations, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error guardando traducciones a archivo:', error);
            return false;
        }
    }

    // Limpiar caché
    clearCache() {
        this.translationCache.clear();
        this.initializeCache(); // Recargar traducciones básicas
    }
}

// Singleton global
const translationSystem = new TranslationSystem();

// Crear archivo de traducciones si no existe
const translationsFile = path.join(__dirname, 'translations.json');
if (!fs.existsSync(translationsFile)) {
    translationSystem.saveTranslationsToFile(translationsFile);
}

module.exports = translationSystem;