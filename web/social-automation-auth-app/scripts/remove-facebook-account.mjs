/**
 * Facebook Account Bağlantısını Kaldır
 * Sadece belirtilen Facebook hesabının bağlantısını kaldırır
 * 
 * Usage: node scripts/remove-facebook-account.mjs
 */

import { MongoClient } from 'mongodb';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function removeFacebookAccount() {
  let client = null;

  try {
    console.log('\n🔧 Facebook Account Bağlantısını Kaldırma');
    console.log('==========================================\n');

    // MongoDB bağlantısı
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı\n');

    const db = client.db(env.MONGODB_DB);

    // 1. accounts collection'dan Facebook kaydını sil
    const accountsCollection = db.collection('accounts');
    
    // Önce mevcut Facebook kayıtlarını listele
    const facebookAccounts = await accountsCollection.find({ provider: 'facebook' }).toArray();
    
    if (facebookAccounts.length === 0) {
      console.log('ℹ️  Hiç Facebook account bağlantısı bulunamadı');
    } else {
      console.log(`📋 Bulunan Facebook bağlantıları: ${facebookAccounts.length}`);
      facebookAccounts.forEach((acc, i) => {
        console.log(`   ${i + 1}. User ID: ${acc.userId}, Provider Account: ${acc.providerAccountId}`);
      });
      
      // Tüm Facebook kayıtlarını sil
      const result = await accountsCollection.deleteMany({ provider: 'facebook' });
      console.log(`\n✅ ${result.deletedCount} Facebook account bağlantısı silindi`);
    }

    // 2. Instagram için de aynısını yap (aynı sorun olabilir)
    const instagramAccounts = await accountsCollection.find({ provider: 'instagram' }).toArray();
    
    if (instagramAccounts.length === 0) {
      console.log('ℹ️  Hiç Instagram account bağlantısı bulunamadı');
    } else {
      console.log(`\n📋 Bulunan Instagram bağlantıları: ${instagramAccounts.length}`);
      instagramAccounts.forEach((acc, i) => {
        console.log(`   ${i + 1}. User ID: ${acc.userId}, Provider Account: ${acc.providerAccountId}`);
      });
      
      const result = await accountsCollection.deleteMany({ provider: 'instagram' });
      console.log(`✅ ${result.deletedCount} Instagram account bağlantısı silindi`);
    }

    console.log('\n✅ İşlem tamamlandı!');
    console.log('💡 Artık Facebook ve Instagram\'ı tekrar bağlayabilirsin.\n');

    // Script'i sil
    try {
      unlinkSync(__filename);
      console.log('🗑️  Script kendini sildi');
    } catch {
      console.log('⚠️  Script silinemedi (manuel silebilirsin)');
    }

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB bağlantısı kapatıldı');
    }
  }
}

removeFacebookAccount();
