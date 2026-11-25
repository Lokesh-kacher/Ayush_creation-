const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDatabase = require('../config/database');
const Admin = require('../models/Admin');

// Helper to ask a question with masked password support
function askQuestion(query, isPassword = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (!isPassword) {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    } else {
      process.stdout.write(query);
      let password = '';
      
      const onData = (char) => {
        char = char.toString('utf8');
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.removeListener('data', onData);
            process.stdin.setRawMode(false);
            rl.close();
            console.log(); // newline
            resolve(password.trim());
            break;
          case '\u0003': // Ctrl+C
            process.exit();
            break;
          case '\u0008': // Backspace
          case '\x7f':
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      };

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', onData);
    }
  });
}

async function createAdmin() {
  console.log('\n======================================================');
  console.log('🛡️  AYUSH CREATION — SECURE ADMIN BOOTSTRAP WIZARD');
  console.log('======================================================');

  try {
    // 1. Connect to MongoDB
    console.log('🔄 Connecting to MongoDB database...');
    await connectDatabase();

    // 2. Prompt for Name
    let name = '';
    while (!name) {
      name = await askQuestion('👤 Enter Admin Full Name: ');
      if (!name) console.log('❌ Name cannot be empty. Please enter a valid name.');
    }

    // 3. Prompt for Email
    let email = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    while (!email || !emailRegex.test(email)) {
      email = await askQuestion('📧 Enter Admin Email Address: ');
      if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format. Example: admin@ayushcreation.com');
      }
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log(`\n⚠️  An admin account with email "${email}" already exists!`);
      const overwrite = await askQuestion('Do you want to reset this admin\'s password? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Operation cancelled. Exiting safely.');
        process.exit(0);
      }
    }

    // 4. Prompt for Password
    let password = '';
    while (password.length < 8) {
      password = await askQuestion('🔑 Enter Secure Password (min 8 chars): ', true);
      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters long for security.');
      }
    }

    const confirmPassword = await askQuestion('🔑 Confirm Password: ', true);
    if (password !== confirmPassword) {
      console.log('\n❌ Passwords do not match! Bootstrap cancelled.');
      process.exit(1);
    }

    // 5. Hash Password & Save
    console.log('\n🔒 Encrypting password with bcrypt (10 rounds)...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAdmin) {
      existingAdmin.name = name;
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.isActive = true;
      existingAdmin.refreshToken = null;
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      const newAdmin = new Admin({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
        isActive: true
      });
      await newAdmin.save();
      console.log('✅ New Admin created successfully!');
    }

    console.log('\n======================================================');
    console.log('🎉 Admin Account Ready:');
    console.log(`   Name:  ${name}`);
    console.log(`   Email: ${email.toLowerCase()}`);
    console.log(`   Role:  admin`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Admin creation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected. Exiting safely.\n');
    process.exit(0);
  }
}

createAdmin();
