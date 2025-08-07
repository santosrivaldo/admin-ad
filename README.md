# AD Admin System

Sistema web seguro para administração de contas do Active Directory, permitindo que administradores de TI desativem contas de usuários com auditoria completa.

## Funcionalidades

- ✅ Autenticação segura para administradores
- ✅ Busca de usuários por samAccountName ou nome completo
- ✅ Exibição detalhada de informações do usuário
- ✅ Desativação de contas de usuário
- ✅ Sistema completo de logs de auditoria
- ✅ Interface responsiva e moderna
- ✅ Containerização com Docker

## Tecnologias Utilizadas

- **Frontend**: React + Next.js + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express (API Routes do Next.js)
- **Autenticação**: JWT (JSON Web Tokens)
- **LDAP**: ldapjs para conexão com Active Directory
- **Containerização**: Docker + Docker Compose

## Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao Active Directory (para produção)
- Node.js 18+ (para desenvolvimento local)

## Instalação e Execução

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd ad-admin-system
\`\`\`

### 2. Configure as variáveis de ambiente
Edite o arquivo `docker-compose.yml` e configure:

\`\`\`yaml
environment:
  - JWT_SECRET=your-super-secret-jwt-key-change-this
  - LDAP_URL=ldap://your-domain-controller:389
  - LDAP_BIND_DN=admin@yourdomain.com
  - LDAP_BIND_PASSWORD=your-ldap-password
  - LDAP_BASE_DN=DC=yourdomain,DC=com
\`\`\`

### 3. Execute com Docker
\`\`\`bash
# Build e start dos containers
docker-compose up -d

# Verificar logs
docker-compose logs -f ad-admin-web
\`\`\`

### 4. Acesse a aplicação
Abra o navegador em: `http://localhost:3000`

**Credenciais de demonstração:**
- Usuário: `admin`
- Senha: `admin123`

## Desenvolvimento Local

\`\`\`bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
\`\`\`

## Configuração do Active Directory

### 1. Configuração LDAP
Para conectar ao AD real, configure as variáveis:

\`\`\`bash
LDAP_URL=ldap://your-dc.domain.com:389
LDAP_BIND_DN=CN=Service Account,OU=Service Accounts,DC=domain,DC=com
LDAP_BIND_PASSWORD=service-account-password
LDAP_BASE_DN=DC=domain,DC=com
\`\`\`

### 2. Conta de Serviço
Crie uma conta de serviço no AD com permissões para:
- Ler informações de usuários
- Modificar atributo `userAccountControl`
- Acesso de leitura ao diretório

### 3. Configuração de Firewall
Certifique-se que a porta 389 (LDAP) ou 636 (LDAPS) esteja acessível.

## Segurança

### Implementações de Segurança
- ✅ Autenticação JWT com expiração
- ✅ Validação de entrada em todas as APIs
- ✅ Logs de auditoria completos
- ✅ Sanitização de dados
- ✅ Headers de segurança
- ✅ Controle de acesso baseado em roles

### Recomendações para Produção
1. **Use HTTPS**: Configure SSL/TLS
2. **Senhas Fortes**: Use senhas complexas para JWT_SECRET
3. **LDAPS**: Use conexão criptografada (porta 636)
4. **Firewall**: Restrinja acesso às portas necessárias
5. **Backup**: Configure backup dos logs de auditoria
6. **Monitoramento**: Implemente alertas para ações críticas

## Estrutura do Projeto

\`\`\`
ad-admin-system/
├── app/
│   ├── api/
│   │   ├── auth/          # Endpoints de autenticação
│   │   ├── users/         # Endpoints de usuários
│   │   └── audit/         # Endpoints de auditoria
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── admin-dashboard.tsx
│   └── login-form.tsx
├── lib/
│   └── ldap-client.js     # Cliente LDAP
├── docker-compose.yml
├── Dockerfile
└── README.md
\`\`\`

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verificar token JWT

### Usuários
- `GET /api/users/search?q=termo` - Buscar usuário
- `POST /api/users/disable` - Desativar usuário

### Auditoria
- `GET /api/audit/logs` - Obter logs de auditoria

## Logs de Auditoria

O sistema registra todas as ações críticas:
- Login/logout de administradores
- Buscas realizadas
- Desativações de usuários
- Tentativas de acesso negado

Formato do log:
\`\`\`json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "adminUser": "Administrador",
  "action": "Usuário desativado: jsilva",
  "targetUser": "jsilva",
  "ip": "192.168.1.100"
}
\`\`\`

## Troubleshooting

### Erro de Conexão LDAP
\`\`\`bash
# Testar conectividade
telnet your-dc.domain.com 389

# Verificar logs do container
docker-compose logs ad-admin-web
\`\`\`

### Erro de Autenticação
- Verifique as credenciais da conta de serviço
- Confirme as permissões no AD
- Teste a conta manualmente

### Problemas de Performance
- Use LDAPS para conexões criptografadas
- Implemente cache para consultas frequentes
- Configure índices no AD se necessário

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação do Active Directory
- Verifique os logs de auditoria para troubleshooting
