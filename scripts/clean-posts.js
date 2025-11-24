#!/usr/bin/env node

/**
 * Clean all posts from P-Weibo
 */

import fetch from 'node-fetch';

const config = {
    apiUrl: process.argv.find(arg => arg.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:8080/api',
    email: process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1] || '3331322@gmail.com',
    password: process.argv.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'ca123456789',
};

// Helper to extract JSON from response that may have PHP warnings
async function safeParseJSON(response) {
    const text = await response.text();
    try {
        // Try to find JSON in the response (after any PHP warnings)
        const jsonMatch = text.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error('   ⚠️  響應解析失敗:', text.substring(0, 200));
        throw new Error(`Invalid JSON: ${text.substring(0, 100)}`);
    }
}

async function login() {
    const res = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: config.email, password: config.password })
    });

    // Use safeParseJSON instead of res.json()
    try {
        const data = await safeParseJSON(res);
        return data.data?.access_token;
    } catch (e) {
        return null;
    }
}

async function getPosts(token) {
    const posts = [];
    let cursor = null;

    while (true) {
        const url = cursor ? `${config.apiUrl}/posts?cursor=${cursor}&limit=100` : `${config.apiUrl}/posts?limit=100`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        try {
            const data = await safeParseJSON(res);
            if (!data.data?.items || data.data.items.length === 0) break;

            posts.push(...data.data.items);
            cursor = data.data.next_cursor;

            if (!cursor) break;
        } catch (e) {
            console.error('获取帖子失败:', e.message);
            break;
        }
    }

    return posts;
}

async function deletePost(token, postId) {
    const res = await fetch(`${config.apiUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
}

async function main() {
    console.log(`配置: API=${config.apiUrl}, Email=${config.email}`);
    console.log('🔐 登錄中...');
    const token = await login();

    if (!token) {
        console.error('❌ 登錄失敗');
        process.exit(1);
    }

    console.log('✅ 登錄成功\n');

    console.log('📥 獲取所有貼文...');
    const posts = await getPosts(token);
    console.log(`找到 ${posts.length} 篇貼文\n`);

    if (posts.length === 0) {
        console.log('沒有貼文需要刪除');
        return;
    }

    console.log('🗑️  開始刪除...\n');

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const title = post.content ? (post.content.substring(0, 30) + '...') : '(无内容)';
        console.log(`[${i + 1}/${posts.length}] 刪除 (ID:${post.id}): ${title}`);

        const success = await deletePost(token, post.id);
        if (success) {
            console.log('   ✅ 成功');
        } else {
            console.log('   ❌ 失敗');
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✨ 清理完成！');
}

main().catch(console.error);
