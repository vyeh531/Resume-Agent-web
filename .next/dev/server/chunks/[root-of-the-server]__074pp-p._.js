module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/file-parser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const pdf = __turbopack_context__.r("[externals]/pdf-parse [external] (pdf-parse, cjs, [project]/node_modules/pdf-parse)");
const mammoth = __turbopack_context__.r("[externals]/mammoth [external] (mammoth, cjs, [project]/node_modules/mammoth)");
/**
 * 解析 PDF 文件，提取文本
 * @param {Buffer} fileBuffer - PDF 文件内容
 * @returns {Promise<string>} 提取的文本
 */ async function parsePDF(fileBuffer) {
    try {
        console.log("[PDF] 开始解析...");
        const data = await pdf(fileBuffer);
        const text = data.text;
        if (!text || text.trim().length === 0) {
            throw new Error("PDF 中未找到文本内容（可能是扫描版 PDF）");
        }
        console.log(`[PDF] 解析完成，提取 ${text.length} 字符`);
        return text;
    } catch (error) {
        console.error("[PDF] 解析失败:", error.message);
        throw new Error(`PDF 解析失败: ${error.message}`);
    }
}
/**
 * 解析 DOCX 文件，提取文本
 * @param {Buffer} fileBuffer - DOCX 文件内容
 * @returns {Promise<string>} 提取的文本
 */ async function parseDocx(fileBuffer) {
    try {
        console.log("[DOCX] 开始解析...");
        const result = await mammoth.extractRawText({
            buffer: fileBuffer
        });
        const text = result.value;
        if (!text || text.trim().length === 0) {
            throw new Error("DOCX 中未找到文本内容");
        }
        console.log(`[DOCX] 解析完成，提取 ${text.length} 字符`);
        return text;
    } catch (error) {
        console.error("[DOCX] 解析失败:", error.message);
        throw new Error(`Word 文件解析失败: ${error.message}`);
    }
}
module.exports = {
    parsePDF,
    parseDocx
};
}),
"[project]/app/api/parse-file/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/file-parser.js [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'unknown';
        if (!file) return Response.json({
            error: 'No file uploaded'
        }, {
            status: 400
        });
        const fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = fileName.toLowerCase().split('.').pop();
        let text = '';
        if (type === 'pdf' || ext === 'pdf') {
            text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parsePDF"])(buffer);
        } else if (type === 'docx' || ext === 'docx') {
            text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDocx"])(buffer);
        } else if (type === 'txt' || ext === 'txt') {
            text = buffer.toString('utf-8');
        } else {
            return Response.json({
                error: 'Unsupported file type: ' + ext
            }, {
                status: 400
            });
        }
        if (!text || text.trim().length === 0) {
            return Response.json({
                error: 'File content is empty or failed to parse'
            }, {
                status: 400
            });
        }
        return Response.json({
            success: true,
            text,
            fileName,
            length: text.length
        });
    } catch (error) {
        console.error('[Parser Error]', error);
        return Response.json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__074pp-p._.js.map