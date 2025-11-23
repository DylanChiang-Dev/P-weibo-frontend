#!/usr/bin/env node

/**
 * Test created_at parameter with FormData
 */

import fetch from 'node-fetch';
import FormData from 'form-data';

const API_URL = 'http://localhost:8080/api';

async function login() {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: '3331322@gmail.com',
            password: 'ca123456789'
        })
    });
    const data = await res.json();
    return data.data?.access_token;
}

async function testCreatePost(token) {
    const formData = new FormData();
    formData.append('content', '測試時間參數 - 應該是 2012 年');
    formData.append('created_at', '2012-08-27T04:25:01Z');

    console.log('發送的數據:');
    console.log('  content: 測試時間參數 - 應該是 2012 年');
    console.log('  created_at: 2012-08-27T04:25:01Z');
    console.log('');

    const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const data = await res.json();

    if (data.success) {
        console.log('✅ 創建成功');
        console.log('返回的 created_at:', data.data.created_at);
        console.log('貼文 ID:', data.data.id);
    } else {
        console.error('❌ 創建失敗:', data.error);
    }
}

async function main() {
    console.log('測試 created_at 參數...\n');
    const token = await login();
    await testCreatePost(token);
}

main().catch(console.error);
