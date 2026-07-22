import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoint: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API endpoint: AI Analysis for Work Reports using Gemini API
  app.post("/api/reports/generate-ai-summary", async (req, res) => {
    try {
      const { reportType, periodName, departmentName, stats, overdueTasks, totalTasks } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY chưa được cấu hình trong môi trường hệ thống."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Bạn là Trợ lý AI Quản lý Tiến độ Công tác thuộc Trưởng Công an xã Chiềng Sinh. 
Hãy viết báo cáo tổng hợp chuyên nghiệp bằng tiếng Việt cho ${reportType === "weekly" ? "BÁO CÁO TUẦN" : "BÁO CÁO THÁNG"} (${periodName}) ${departmentName ? `tại ${departmentName}` : "Toàn Công an xã Chiềng Sinh"}.

Dữ liệu thống kê tiến độ công việc các Tổ công tác:
- Tổng số công việc: ${totalTasks}
- Số việc đã hoàn thành: ${stats.completed} (${stats.completionRate}%)
- Số việc đang thực hiện: ${stats.inProgress}
- Số việc chưa thực hiện: ${stats.todo}
- CẢNH BÁO CÔNG VIỆC QUÁ HẠN (MÀU ĐỎ): ${stats.overdue} việc (${stats.overdueRate}%)
- Danh sách một số việc quá hạn nghiêm trọng:
${overdueTasks && overdueTasks.length > 0 
  ? overdueTasks.map((t: any, i: number) => `  ${i+1}. [${t.department}] ${t.title} - Phụ trách: ${t.assignee} - Quá hạn: ${t.daysOverdue} ngày`).join("\n") 
  : "  Không có công việc quá hạn."}

Hãy cấu trúc bài báo cáo theo 4 mục rõ ràng, súc tích, chuẩn phong cách hành chính công an nhân dân:
1. ĐÁNH GIÁ TỔNG QUAN TIẾN ĐỘ CÔNG TÁC (Nêu bật tỷ lệ hoàn thành nhiệm vụ được giao)
2. PHÂN TÍCH ĐIỂM NGHẼN & VIỆC QUÁ HẠN (Chỉ rõ Tổ công tác/công việc chậm tiến độ, nguyên nhân & rủi ro)
3. ĐÁNH GIÁ CÁC TỔ CÔNG TÁC (Khen thưởng Tổ hoàn thành tốt hoặc nhắc nhở Tổ có nhiều việc quá hạn)
4. ĐỀ XUẤT KIẾN NGHỊ & GIẢI PHÁP TRỌNG TÂM (3-4 giải pháp cụ thể để Trưởng Công an xã chỉ đạo đôn đốc)

Định dạng văn bản sạch, chuyên nghiệp với biểu tượng bullet points, tiêu đề rõ ràng, trang trọng.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      const aiText = response.text || "Không thể tạo báo cáo tự động từ AI.";

      res.json({
        summary: aiText,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo báo cáo AI:", error);
      res.status(500).json({
        error: "Đã xảy ra lỗi khi tạo báo cáo AI.",
        details: error?.message || String(error)
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Hệ thống Quản lý Công việc] Đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
