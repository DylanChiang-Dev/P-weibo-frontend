#!/usr/bin/env node

/**
 * WordPress to P-Weibo Migration Tool with Auto-Login
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const config = {
    wpApiUrl: process.argv.find(arg => arg.startsWith('--wp-url='))?.split('=')[1] || 'https://x.3331322.xyz',
    pWeiboApiUrl: process.argv.find(arg => arg.startsWith('--api-url='))?.split('=')[1] || 'http://localhost:8080/api',
    pWeiboEmail: process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1] || '3331322@gmail.com',
    pWeiboPassword: process.argv.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'ca123456789',
    adminToken: null,
    mediaDir: path.join(__dirname, 'wordpress-media'),
    batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '3'),
    delay: parseInt(process.argv.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '2000'),
    skipMedia: process.argv.includes('--skip-media'),
    dryRun: process.argv.includes('--dry-run'),
    reverse: process.argv.includes('--reverse'), // Migrate from oldest to newest
    maxPosts: parseInt(process.argv.find(arg => arg.startsWith('--max='))?.split('=')[1] || '999999'),
    skip: parseInt(process.argv.find(arg => arg.startsWith('--skip='))?.split('=')[1] || '0'),
};

// Statistics
const stats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
};

// Login to P-Weibo and get token
async function loginToPWeibo() {
    console.log('🔐 正在登錄 P-Weibo...');

    try {
        const res = await fetch(`${config.pWeiboApiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: config.pWeiboEmail,
                password: config.pWeiboPassword
            })
        });

        // Get response as text first to handle PHP warnings
        const text = await res.text();

        // Extract JSON from response (remove PHP warnings)
        let data;
        try {
            // Try to find JSON in the response
            const jsonMatch = text.match(/\{[\s\S]*\}$/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            } else {
                data = JSON.parse(text);
            }
        } catch (e) {
            console.error('❌ 無法解析響應:', text.substring(0, 200));
            return false;
        }

        if (res.ok && data.data?.access_token) {
            config.adminToken = data.data.access_token;
            console.log('✅ 登錄成功\n');
            return true;
        } else {
            console.error('❌ 登錄失敗:', data.error || res.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ 登錄錯誤:', error.message);
        return false;
    }
}

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function cleanHtml(html) {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// Fetch WordPress posts
async function fetchWordPressPosts() {
    console.log('📥 正在從 WordPress 獲取貼文...');
    const posts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && posts.length < config.maxPosts) {
        try {
            // Add sorting params for reverse mode (oldest first)
            const sortParams = config.reverse ? '&order=asc&orderby=date' : '';
            const url = `${config.wpApiUrl}/wp-json/wp/v2/posts?page=${page}&per_page=100&_embed${sortParams}`;
            console.log(`   獲取第 ${page} 頁...`);

            const res = await fetch(url);
            if (!res.ok) {
                console.error(`   ⚠️  警告: 獲取失敗 (${res.status})`);
                break;
            }

            const data = await res.json();

            if (data.length === 0) {
                hasMore = false;
            } else {
                posts.push(...data);
                page++;
                await sleep(500);
            }
        } catch (error) {
            console.error(`   ❌ 錯誤: ${error.message}`);
            hasMore = false;
        }
    }

    const limitedPosts = posts.slice(0, config.maxPosts);
    console.log(`✅ 找到 ${posts.length} 篇貼文，將遷移 ${limitedPosts.length} 篇\n`);
    return limitedPosts;
}

// Download media file
async function downloadMedia(url, filename) {
    if (config.skipMedia) return null;

    try {
        if (!fs.existsSync(config.mediaDir)) {
            fs.mkdirSync(config.mediaDir, { recursive: true });
        }

        const filePath = path.join(config.mediaDir, filename);

        if (fs.existsSync(filePath)) {
            return filePath;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const buffer = await res.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        return filePath;
    } catch (error) {
        console.error(`      ⚠️  媒體下載失敗: ${error.message}`);
        return null;
    }
}

// Extract images from content
function extractImagesFromContent(html) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        // Fix old domain URL
        let imageUrl = match[1];
        imageUrl = imageUrl.replace('wb.3331322.xyz', 'x.3331322.xyz');
        images.push(imageUrl);
    }

    return images;
}

// Helper for authenticated requests with retry on 401
async function authenticatedFetch(url, options) {
    let res = await fetch(url, options);

    if (res.status === 401) {
        console.log('   🔄 Token expired, refreshing...');
        const loginSuccess = await loginToPWeibo();
        if (loginSuccess) {
            // Update token in headers
            options.headers['Authorization'] = `Bearer ${config.adminToken}`;
            res = await fetch(url, options);
        } else {
            console.error('   ❌ Re-login failed');
        }
    }
    return res;
}

// Migrate single post
async function migratePost(wpPost, index, total) {
    const title = wpPost.title.rendered || '(無標題)';
    console.log(`\n[${index + 1}/${total}] ${title}`);
    console.log(`   WordPress 時間: ${wpPost.date}`);
    console.log(`   GMT 時間: ${wpPost.date_gmt}Z`);

    if (config.dryRun) {
        console.log('   🔍 DRY RUN - 跳過實際上傳');
        stats.skipped++;
        return;
    }

    try {
        const formData = new FormData();

        // Content - only body text, no title
        const content = cleanHtml(wpPost.content.rendered);

        // Only skip if completely empty (allow short posts like "要回去了~")
        if (!content || content.trim().length === 0) {
            console.log('   ⚠️  內容為空，跳過');
            stats.skipped++;
            return;
        }

        formData.append('content', content);

        // Use GMT time with Z suffix to indicate UTC
        // WordPress provides date_gmt which is already in UTC
        const createdAt = wpPost.date_gmt ? `${wpPost.date_gmt}Z` : wpPost.date;
        formData.append('created_at', createdAt);

        let imageCount = 0;

        // Featured image
        if (wpPost._embedded?.['wp:featuredmedia']?.[0]) {
            const featuredMedia = wpPost._embedded['wp:featuredmedia'][0];
            let imageUrl = featuredMedia.source_url;

            // Fix old domain URL
            imageUrl = imageUrl.replace('wb.3331322.xyz', 'x.3331322.xyz');

            const filename = path.basename(new URL(imageUrl).pathname);

            console.log(`   📷 下載特色圖片: ${filename}`);
            const localPath = await downloadMedia(imageUrl, filename);

            if (localPath && fs.existsSync(localPath)) {
                formData.append('images[]', fs.createReadStream(localPath));
                imageCount++;
            }
        }

        // Additional images from content (max 9 total)
        if (!config.skipMedia && imageCount < 9) {
            const contentImages = extractImagesFromContent(wpPost.content.rendered);
            if (contentImages.length > 0) {
                console.log(`   📷 找到 ${contentImages.length} 張內容圖片`);

                for (const imageUrl of contentImages.slice(0, 9 - imageCount)) {
                    try {
                        const filename = path.basename(new URL(imageUrl).pathname);
                        const localPath = await downloadMedia(imageUrl, filename);

                        if (localPath && fs.existsSync(localPath)) {
                            formData.append('images[]', fs.createReadStream(localPath));
                            imageCount++;
                        }
                    } catch (err) {
                        // Skip invalid URLs
                    }
                }
            }
        }


        // Upload to P-Weibo
        console.log(`   ⬆️  上傳到 P-Weibo (${imageCount} 張圖片)...`);
        const createRes = await authenticatedFetch(`${config.pWeiboApiUrl}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.adminToken}`
            },
            body: formData
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            console.error(`   ❌ 創建失敗: ${createRes.status} - ${errText}`);
            stats.failed++;
            return;
        }

        const createData = await safeParseJSON(createRes);
        const postId = createData.data.id;
        console.log(`   ✅ 貼文已創建 (ID: ${postId})`);

        // Update created_at using PATCH
        // Because POST FormData might not handle created_at correctly in backend
        console.log(`   ⏰ 更新時間為: ${createdAt}`);

        const updateRes = await authenticatedFetch(`${config.pWeiboApiUrl}/posts/${postId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${config.adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                created_at: createdAt
            })
        });

        if (updateRes.ok) {
            console.log(`   ✅ 時間更新成功`);
            stats.success++;
        } else {
            const error = await updateRes.text();
            console.error(`   ⚠️  時間更新失敗: ${updateRes.status} - ${error.substring(0, 100)}`);
            console.log(`   ℹ️  貼文已創建但時間為當前時間`);
            stats.success++; // Still count as success since post was created
        }

    } catch (error) {
        console.error(`   ❌ 錯誤: ${error.message}`);
        stats.failed++;
    }
}

// Main migration process
async function main() {
    console.log('🚀 WordPress 到 P-Weibo 遷移工具\n');
    console.log('配置:');
    console.log(`   WordPress: ${config.wpApiUrl}`);
    console.log(`   P-Weibo API: ${config.pWeiboApiUrl}`);
    console.log(`   批次大小: ${config.batchSize}`);
    console.log(`   延遲時間: ${config.delay}ms`);
    console.log(`   跳過媒體: ${config.skipMedia ? '是' : '否'}`);
    console.log(`   測試模式: ${config.dryRun ? '是' : '否'}`);
    console.log(`   倒序模式: ${config.reverse ? '是（從最舊的開始）' : '否（從最新的開始）'}`);
    console.log(`   最大貼文數: ${config.maxPosts}\n`);

    // Login to P-Weibo
    const loginSuccess = await loginToPWeibo();
    if (!loginSuccess) {
        console.error('無法登錄 P-Weibo，遷移中止');
        process.exit(1);
    }

    // Fetch WordPress posts
    const wpPosts = await fetchWordPressPosts();

    if (wpPosts.length === 0) {
        console.log('⚠️  沒有找到貼文');
        return;
    }

    stats.total = wpPosts.length;

    // Migrate posts
    let postsToMigrate = wpPosts;
    if (config.skip > 0) {
        console.log(`   ⏭️  跳過前 ${config.skip} 篇貼文`);
        postsToMigrate = wpPosts.slice(config.skip);
        stats.skipped += config.skip;
    }

    console.log(`📤 開始遷移 ${postsToMigrate.length} 篇貼文...\n`);

    for (let i = 0; i < postsToMigrate.length; i += config.batchSize) {
        const batch = postsToMigrate.slice(i, i + config.batchSize);

        for (let j = 0; j < batch.length; j++) {
            await migratePost(batch[j], config.skip + i + j, wpPosts.length);

            if (i + j < postsToMigrate.length - 1) {
                await sleep(config.delay);
            }
        }
    }

    // Final statistics
    console.log('\n\n📊 遷移統計:');
    console.log(`   總數: ${stats.total}`);
    console.log(`   ✅ 成功: ${stats.success}`);
    console.log(`   ❌ 失敗: ${stats.failed}`);
    console.log(`   ⏭️  跳過: ${stats.skipped}`);
    console.log(`   成功率: ${((stats.success / stats.total) * 100).toFixed(1)}%`);

    console.log('\n✨ 遷移完成！');
}

// Run
main().catch(error => {
    console.error('\n💥 嚴重錯誤:', error);
    process.exit(1);
});
