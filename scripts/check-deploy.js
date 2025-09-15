#!/usr/bin/env node

/**
 * Script de verificação pré-deploy
 * Verifica se o projeto está pronto para deploy no Vercel
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verificando projeto para deploy...\n');

// Verificações
const checks = [
  {
    name: 'package.json',
    check: () => fs.existsSync('package.json'),
    message: '✅ package.json encontrado'
  },
  {
    name: 'vite.config.js',
    check: () => fs.existsSync('vite.config.js'),
    message: '✅ vite.config.js encontrado'
  },
  {
    name: 'vercel.json',
    check: () => fs.existsSync('vercel.json'),
    message: '✅ vercel.json encontrado'
  },
  {
    name: 'manifest.json',
    check: () => fs.existsSync('public/manifest.json'),
    message: '✅ manifest.json encontrado'
  },
  {
    name: 'service-worker',
    check: () => fs.existsSync('public/sw.js'),
    message: '✅ service-worker encontrado'
  },
  {
    name: 'offline.html',
    check: () => fs.existsSync('public/offline.html'),
    message: '✅ offline.html encontrado'
  },
  {
    name: 'ícones PWA',
    check: () => {
      const iconDir = 'public/icons';
      if (!fs.existsSync(iconDir)) return false;
      const icons = fs.readdirSync(iconDir);
      return icons.some(icon => icon.includes('icon-192x192.png'));
    },
    message: '✅ ícones PWA encontrados'
  },
  {
    name: 'src/main.jsx',
    check: () => fs.existsSync('src/main.jsx'),
    message: '✅ main.jsx encontrado'
  },
  {
    name: 'src/App.jsx',
    check: () => fs.existsSync('src/App.jsx'),
    message: '✅ App.jsx encontrado'
  },
  {
    name: 'src/hooks/useAuth.jsx',
    check: () => fs.existsSync('src/hooks/useAuth.jsx'),
    message: '✅ useAuth.jsx encontrado'
  }
];

// Executar verificações
let allPassed = true;

checks.forEach(check => {
  try {
    if (check.check()) {
      console.log(check.message);
    } else {
      console.log(`❌ ${check.name} não encontrado`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar ${check.name}:`, error.message);
    allPassed = false;
  }
});

// Verificar dependências críticas
console.log('\n📦 Verificando dependências...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = [
  'react',
  'react-dom',
  'react-router-dom',
  'antd',
  '@ant-design/icons',
  'vite'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} encontrado`);
  } else {
    console.log(`❌ ${dep} não encontrado`);
    allPassed = false;
  }
});

// Verificar scripts
console.log('\n🔧 Verificando scripts...');

const requiredScripts = ['dev', 'build', 'preview'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ script ${script} encontrado`);
  } else {
    console.log(`❌ script ${script} não encontrado`);
    allPassed = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 PROJETO PRONTO PARA DEPLOY!');
  console.log('\n📋 Próximos passos:');
  console.log('1. npm run build');
  console.log('2. vercel --prod');
  console.log('3. Testar funcionalidades');
  console.log('4. Configurar domínio personalizado');
} else {
  console.log('❌ PROJETO NÃO ESTÁ PRONTO PARA DEPLOY');
  console.log('\n🔧 Corrija os erros acima antes de fazer o deploy');
}

console.log('\n📚 Documentação: DEPLOY_VERCEL.md');
console.log('🌐 Vercel: https://vercel.com');
