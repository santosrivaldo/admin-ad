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

export async function GET(request) {
  try {
    // Verificar autenticação
    const decoded = verifyToken(request)
    
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

    return NextResponse.json({ logs: logs.slice(0, 20) }) // Retornar últimos 20 logs

  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    
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
