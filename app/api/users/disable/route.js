import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido')
  }

  const token = authHeader.substring(7)
  return jwt.verify(token, JWT_SECRET)
}

function logAuditAction(adminUser, action, targetUser) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    adminUser: adminUser,
    action: action,
    targetUser: targetUser,
    ip: 'localhost' // Em produção, capturar IP real
  }

  // Salvar log em arquivo (em produção, usar banco de dados)
  const logPath = path.join(process.cwd(), 'audit-logs.json')
  let logs = []
  
  try {
    if (fs.existsSync(logPath)) {
      const data = fs.readFileSync(logPath, 'utf8')
      logs = JSON.parse(data)
    }
  } catch (error) {
    console.error('Erro ao ler logs:', error)
  }

  logs.unshift(logEntry) // Adicionar no início
  logs = logs.slice(0, 100) // Manter apenas os últimos 100 logs

  try {
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))
  } catch (error) {
    console.error('Erro ao salvar log:', error)
  }
}

export async function POST(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request)
    
    const { samAccountName } = await request.json()

    if (!samAccountName) {
      return NextResponse.json(
        { message: 'samAccountName é obrigatório' },
        { status: 400 }
      )
    }

    // Em produção, aqui seria a conexão LDAP para desativar o usuário
    // Exemplo com ldapjs:
    /*
    const ldap = require('ldapjs');
    const client = ldap.createClient({
      url: 'ldap://your-domain-controller:389'
    });
    
    client.bind('admin@domain.com', 'password', (err) => {
      if (err) throw err;
      
      const userDN = `CN=${samAccountName},OU=Users,DC=domain,DC=com`;
      const change = new ldap.Change({
        operation: 'replace',
        modification: {
          userAccountControl: '514' // Disabled account
        }
      });
      
      client.modify(userDN, change, (err) => {
        if (err) throw err;
        console.log('User disabled successfully');
      });
    });
    */

    // Mock: simular desativação
    console.log(`Desativando usuário: ${samAccountName}`)

    // Registrar log de auditoria
    logAuditAction(
      decoded.displayName,
      `Usuário desativado: ${samAccountName}`,
      samAccountName
    )

    return NextResponse.json({
      message: 'Usuário desativado com sucesso',
      samAccountName
    })

  } catch (error) {
    console.error('Erro ao desativar usuário:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
