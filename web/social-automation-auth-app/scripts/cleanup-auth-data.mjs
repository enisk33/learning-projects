/**
 * One-Time Auth Data Cleanup Script
 * Bu script bir kere çalışır, tüm OAuth ve auth verilerini temizler ve kendini siler
 * 
 * Usage: node scripts/cleanup-auth-data.mjs
 * 
 * ⚠️ UYARI: Bu script çalıştıktan sonra kendini silecektir!
 */

import { MongoClient } from 'mongodb';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPT_PATH = __filename;

// .env.local dosyasını oku
function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

loadEnv();

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB || 'projectdemiray',
};

if (!env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable bulunamadı!');
  process.exit(1);
}

// Kullanıcıdan onay al
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Script'i kendini sil
function selfDestruct() {
  try {
    if (existsSync(SCRIPT_PATH)) {
      unlinkSync(SCRIPT_PATH);
      console.log('\n✅ Cleanup script kendini sildi (bir daha çalışmayacak)');
    }
  } catch (error) {
    console.warn('\n⚠️  Script silinemedi (manuel olarak silebilirsiniz):', error.message);
    console.log(`   Script yolu: ${SCRIPT_PATH}`);
  }
}

async function cleanupAuthData() {
  let client = null;

  try {
    console.log('\n🧹 Auth Verileri Temizleme Script\'i');
    console.log('=====================================');
    console.log('⚠️  Bu script bir kere çalışacak ve kendini silecek!\n');

    // Onay iste
    const answer = await askQuestion(
      '⚠️  Bu işlem TÜM OAuth ve auth verilerini silecek. Devam etmek istiyor musunuz? (yes/no): '
    );

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ İşlem iptal edildi');
      process.exit(0);
    }

    console.log('\n🧹 Auth verileri temizleniyor...\n');

    // MongoDB bağlantısı
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı\n');

    const db = client.db(env.MONGODB_DB);

    // Tüm collection'ları listele
    const collections = await db.listCollections().toArray();
    console.log('📋 Mevcut collection\'lar:', collections.map(c => c.name).join(', '));
    console.log('');

    // NextAuth collection'ları
    const nextAuthCollections = [
      'accounts',        // NextAuth OAuth accounts
      'sessions',        // NextAuth sessions (JWT kullanıyoruz ama yine de olabilir)
      'verification_tokens', // NextAuth verification tokens
    ];

    // Custom collection'lar
    const customCollections = [
      'user_tokens',     // Custom token collection
    ];

    let totalDeleted = 0;

    // NextAuth collection'larını temizle
    for (const collectionName of nextAuthCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          const result = await collection.deleteMany({});
          console.log(`✅ ${collectionName}: ${result.deletedCount} kayıt silindi`);
          totalDeleted += result.deletedCount;
        } else {
          console.log(`ℹ️  ${collectionName}: Zaten boş`);
        }
      } catch (error) {
        console.log(`⚠️  ${collectionName}: Collection bulunamadı veya hata oluştu`);
      }
    }

    // Custom collection'ları temizle
    for (const collectionName of customCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          const result = await collection.deleteMany({});
          console.log(`✅ ${collectionName}: ${result.deletedCount} kayıt silindi`);
          totalDeleted += result.deletedCount;
        } else {
          console.log(`ℹ️  ${collectionName}: Zaten boş`);
        }
      } catch (error) {
        console.log(`⚠️  ${collectionName}: Collection bulunamadı veya hata oluştu`);
      }
    }

    // Users collection'ını temizle (opsiyonel - dikkatli!)
    const cleanUsers = await askQuestion(
      '\n⚠️  Users collection\'ını da temizlemek istiyor musunuz? (Bu tüm kullanıcıları silecek!) (yes/no): '
    );

    if (cleanUsers.toLowerCase() === 'yes' || cleanUsers.toLowerCase() === 'y') {
      try {
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        if (userCount > 0) {
          const result = await usersCollection.deleteMany({});
          console.log(`✅ users: ${result.deletedCount} kullanıcı silindi`);
          totalDeleted += result.deletedCount;
        } else {
          console.log(`ℹ️  users: Zaten boş`);
        }
      } catch (error) {
        console.log(`⚠️  users: Collection bulunamadı veya hata oluştu`);
      }
    } else {
      console.log('ℹ️  users: Temizlenmedi (kullanıcılar korundu)');
    }

    console.log(`\n✅ Toplam ${totalDeleted} kayıt silindi`);
    console.log('✅ Auth verileri başarıyla temizlendi\n');

    // Script'i kendini sil
    selfDestruct();

  } catch (error) {
    console.error('\n❌ Cleanup hatası:', error);
    // Hata olsa bile script'i sil (bir daha çalışmasın)
    selfDestruct();
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB bağlantısı kapatıldı');
    }
  }
}

// Script'i çalıştır
cleanupAuthData()
  .then(() => {
    console.log('✅ Cleanup işlemi tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup işlemi başarısız:', error);
    // Hata olsa bile script'i sil
    selfDestruct();
    process.exit(1);
  });
