#!/usr/bin/env node

/**
 * Script para verificar se as variáveis de ambiente estão configuradas corretamente
 *
 * Uso:
 *   node scripts/check-env.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

console.log("\n🔍 Verificando configuração de variáveis de ambiente...\n");

const files = {
  ".env.example": { required: true, description: "Template de exemplo" },
  ".env": { required: false, description: "Desenvolvimento local" },
  ".env.production": { required: false, description: "Produção" },
};

const requiredVars = ["VITE_API_URL"];
const optionalVars = ["VITE_APP_NAME", "VITE_APP_VERSION"];

let hasErrors = false;

// Verificar existência dos arquivos
console.log("📁 Arquivos de configuração:\n");
for (const [fileName, config] of Object.entries(files)) {
  const filePath = path.join(rootDir, fileName);
  const exists = fs.existsSync(filePath);

  if (exists) {
    console.log(`  ✅ ${fileName.padEnd(20)} - ${config.description}`);

    // Ler e verificar variáveis
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const vars = {};

    lines.forEach((line) => {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        vars[match[1]] = match[2];
      }
    });

    // Verificar variáveis obrigatórias
    const missingVars = requiredVars.filter((v) => !vars[v]);
    if (missingVars.length > 0) {
      console.log(`     ⚠️  Variáveis faltando: ${missingVars.join(", ")}`);
      hasErrors = true;
    }

    // Mostrar valor da VITE_API_URL
    if (vars.VITE_API_URL) {
      console.log(`     → VITE_API_URL: ${vars.VITE_API_URL}`);
    }
  } else {
    const status = config.required ? "❌" : "⚠️ ";
    console.log(
      `  ${status} ${fileName.padEnd(20)} - ${
        config.description
      } (não encontrado)`
    );
    if (config.required) {
      hasErrors = true;
    }
  }
}

// Verificar .gitignore
console.log("\n🔒 Proteção de arquivos:\n");
const gitignorePath = path.join(rootDir, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, "utf-8");

  if (gitignore.includes(".env") || gitignore.includes("*.env.local")) {
    console.log("  ✅ .gitignore configurado corretamente");
    console.log("     → Arquivos .env estão protegidos");
  } else {
    console.log("  ⚠️  .gitignore NÃO protege arquivos .env");
    console.log('     → Adicione ".env" ao .gitignore');
    hasErrors = true;
  }
} else {
  console.log("  ❌ .gitignore não encontrado");
  hasErrors = true;
}

// Verificar arquivos de serviço
console.log("\n🔌 Serviços da API:\n");
const services = [
  "src/services/api.auth.ts",
  "src/services/api.product.ts",
  "src/services/api.customer.ts",
  "src/services/api.order.ts",
  "src/services/api.lpu.ts",
  "src/services/api.tax.ts",
];

let servicesConfigured = 0;
for (const service of services) {
  const servicePath = path.join(rootDir, service);
  if (fs.existsSync(servicePath)) {
    const content = fs.readFileSync(servicePath, "utf-8");
    if (content.includes("VITE_API_URL")) {
      console.log(`  ✅ ${path.basename(service)}`);
      servicesConfigured++;
    } else {
      console.log(`  ⚠️  ${path.basename(service)} - não usa VITE_API_URL`);
    }
  }
}

console.log(
  `\n     Total: ${servicesConfigured}/${services.length} serviços configurados`
);

// Resumo final
console.log("\n" + "=".repeat(60));
if (hasErrors) {
  console.log("❌ ERROS ENCONTRADOS - Corrija as configurações acima");
  process.exit(1);
} else {
  console.log("✅ TUDO CERTO - Variáveis de ambiente configuradas!");
  console.log("\n📚 Próximos passos:");
  console.log("   1. Para desenvolvimento: npm run dev");
  console.log(
    "   2. Para produção: edite .env.production e rode npm run build"
  );
  console.log("\n📖 Documentação:");
  console.log("   - ENV_CONFIG.md  → Guia completo de variáveis");
  console.log("   - DEPLOY.md      → Guia de deploy");
  console.log("   - QUICK_START.md → Referência rápida");
}
console.log("=".repeat(60) + "\n");

process.exit(hasErrors ? 1 : 0);
