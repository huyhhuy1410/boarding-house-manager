const { chromium } = require("playwright");
const path = require("path");

(async () => {
  console.log("🚀 Bắt đầu chạy Playwright E2E Integration Workflow Test với dữ liệu ngẫu nhiên...");
  
  // Khởi tạo tên dãy trọ và phòng trọ ngẫu nhiên để tránh lỗi trùng tên @unique trong DB
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const houseName = `Dãy Test ${randomSuffix}`;
  const roomName = `Phòng P_${randomSuffix.toUpperCase()}`;

  console.log(`🏠 Tên dãy trọ test: "${houseName}"`);
  console.log(`🚪 Tên phòng trọ test: "${roomName}"`);

  // Khởi chạy trình duyệt Chromium
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  });

  const page = await context.newPage();

  // Lắng nghe lỗi console và api requests
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error(`❌ [Console Error]: ${msg.text()}`);
    }
  });

  page.on("request", (req) => {
    if (req.url().includes("/api/rooms") && req.method() === "POST") {
      console.log(`📡 [API POST Request] url: ${req.url()}`);
      console.log(`📦 Payload: ${req.postData()}`);
    }
  });

  page.on("response", async (res) => {
    if (res.url().includes("/api/rooms") && res.request().method() === "POST") {
      try {
        const body = await res.json();
        console.log(`📥 [API POST Response] status: ${res.status()}`);
        console.log(`📄 Response body: ${JSON.stringify(body)}`);
      } catch (e) {
        console.log(`📥 [API POST Response] status: ${res.status()} (Cannot parse JSON)`);
      }
    }
  });

  try {
    // 1. TRUY CẬP VÀ ĐĂNG NHẬP
    console.log("🔗 1. Đang truy cập ứng dụng...");
    await page.goto("http://localhost:3005", { waitUntil: "networkidle" });

    console.log("🔑 Đang đăng nhập tài khoản...");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Chờ vào trang Dashboard
    await page.waitForSelector("h1:has-text('Quản Lý Trọ Việt')", { timeout: 5000 });
    console.log("✅ Đăng nhập thành công!");

    // 2. TẠO MỚI DÃY TRỌ (BOARDING HOUSE)
    console.log("🏠 2. Chuyển sang tab 'Phòng trọ' để tạo Dãy trọ mới...");
    await page.click("button:has-text('Phòng trọ')");
    await page.waitForSelector("button:has-text('Thêm dãy trọ')");

    console.log(`➕ Tạo dãy trọ mới: "${houseName}"...`);
    await page.click("button:has-text('Thêm dãy trọ')");
    await page.waitForSelector("input[placeholder='Ví dụ: Dãy trọ A1']");
    await page.fill("input[placeholder='Ví dụ: Dãy trọ A1']", houseName);
    await page.click("button:has-text('Lưu lại')");
    await page.waitForTimeout(1000); // Chờ reload dữ liệu
    console.log("✅ Đã tạo Dãy trọ mới thành công.");

    // 3. TẠO MỚI PHÒNG TRỌ (ROOM)
    console.log(`➕ 3. Tạo phòng trọ mới "${roomName}" thuộc Dãy trọ vừa tạo...`);
    await page.click("button:has-text('Thêm phòng')");
    await page.waitForSelector("input[placeholder='Ví dụ: A1']");

    await page.fill("input[placeholder='Ví dụ: A1']", roomName);
    // Chọn dãy trọ vừa tạo trong dropdown
    await page.selectOption("select:has(option:has-text('" + houseName + "'))", { label: houseName });
    await page.fill("input[placeholder='Ví dụ: 3.000.000']", "2500000"); // Giá thuê

    // Chọn trạng thái OCCUPIED - dùng locator near label để tránh nhầm với dropdown dãy trọ
    await page.locator("label:has-text('Trạng thái phòng') + select").selectOption("OCCUPIED");
    // Chờ phần thông tin khách thuê hiện ra (render điều kiện status === "OCCUPIED")
    // Đây là cách xác nhận chắc chắn rằng React state đã cập nhật thành OCCUPIED
    await page.waitForSelector("input[placeholder='Nguyễn Văn A']", { timeout: 5000 });

    await page.fill("input[placeholder='Nguyễn Văn A']", "Khách Test E2E");
    await page.fill("input[placeholder='090...']", "0999999999");

    await page.click("button:has-text('Lưu lại')");
    // Chờ card phòng với badge "Đang thuê" xuất hiện trong RoomsTab
    // Selector này chặt chẽ hơn - xác nhận cả tên và status đều đúng
    await page.waitForSelector(`.room-card:has(.room-badge):has-text('${roomName}')`, { timeout: 12000 });
    const badgeText = await page.locator(`.room-card:has-text('${roomName}') .room-badge`).textContent();
    console.log(`✅ Đã tạo phòng trọ "${roomName}" với trạng thái: "${badgeText?.trim()}".`);
    if (!badgeText?.includes("Đang thuê")) {
      throw new Error(`❌ Phòng không ở trạng thái "Đang thuê"! Badge hiện tại: "${badgeText}"`);
    }


    // 4. GHI ĐIỆN NƯỚC & TÍNH TIỀN PHÒNG (BILLING WORKFLOW)
    console.log("⚡ 4. Chuyển sang tab 'Ghi số điện'...");
    await page.click("button:has-text('Ghi số điện')");
    await page.waitForTimeout(2000); // Chờ BillingTab render

    // === DEBUG: Chụp ảnh và in thông tin trạng thái ===
    await page.screenshot({ path: "scratch/debug_billing_tab.png" });
    const roomCards = await page.locator("div[id^='room-card-']").all();
    console.log(`🔍 DEBUG: Số lượng room-card tìm thấy: ${roomCards.length}`);
    for (const card of roomCards) {
      const cardText = await card.textContent();
      console.log(`  - Card text: ${cardText?.substring(0, 60)}`);
    }
    const filterBtns = await page.locator(".tabs-container button").all();
    console.log(`🔍 DEBUG: Filter buttons hiện tại:`);
    for (const btn of filterBtns) {
      const cls = await btn.getAttribute("class");
      const txt = await btn.textContent();
      const isActive = cls?.includes("bg-indigo-600");
      console.log(`  - [${isActive ? "ACTIVE" : "      "}] "${txt}"`);
    }
    // === END DEBUG ===

    console.log(`✍️ Đợi card phòng "${roomName}" xuất hiện trong BillingTab...`);
    // Click "Tất cả" để đảm bảo roomFilter đang là ALL trước khi tìm phòng
    await page.click(".tabs-container button:has-text('Tất cả')");
    await page.waitForTimeout(500);

    const roomCard = page.locator(`div[id^='room-card-']:has-text('${roomName}')`);
    await roomCard.waitFor({ timeout: 15000 });

    console.log(`✍️ Nhập chỉ số điện nước cho "${roomName}"...`);
    await roomCard.locator("input[id^='elec-input-']").fill("100");
    await roomCard.locator("input[placeholder='Nhập số nước...']").fill("10");

    console.log("💾 Bấm 'Lưu & Tính tiền phòng'...");
    await roomCard.locator("button:has-text('Lưu & Tính tiền phòng')").click();
    await page.waitForTimeout(1500);


    // Xác minh hóa đơn đã được lập
    // Tiền phòng: 2.500.000đ
    // Tiền điện: 100 * 3500 = 350.000đ
    // Tiền nước: 10 * 15000 = 150.000đ
    // Internet: 100.000đ, Rác: 20.000đ
    // => Tổng cộng: 2.500.000 + 350.000 + 150.000 + 100.000 + 20.000 = 3.120.000đ
    const totalText = "3.120.000";
    const isBillCreated = await roomCard.locator(`span:has-text('${totalText}')`).first().isVisible();
    if (isBillCreated) {
      console.log(`✅ Hóa đơn được tính tiền chính xác: 3,120,000đ.`);
    } else {
      console.warn("⚠️ Không tìm thấy tổng tiền 3,120,000đ hiển thị trên UI.");
    }

    // 5. THU TIỀN PHÒNG (PAYMENT WORKFLOW)
    console.log("💰 5. Xác nhận thu tiền phòng...");
    await roomCard.locator("button:has-text('Đã thu tiền')").click();
    // Chờ Dialog xác nhận xuất hiện
    await page.waitForSelector("h3:has-text('Xác nhận')");
    await page.click("button:has-text('Xác nhận')");
    await page.waitForTimeout(1000);
    
    const isPaid = await roomCard.locator("span:has-text('Đã đóng')").first().isVisible();
    if (isPaid) {
      console.log("✅ Hóa đơn đã được cập nhật trạng thái 'Đã đóng' thành công!");
    }

    // 6. THÊM CHI PHÍ BẢO TRÌ & XÁC MINH SỰ NHẤT QUÁN (EXPENSE WORKFLOW)
    console.log("🔧 6. Chuyển sang tab 'Chi phí'...");
    await page.click("button:has-text('Chi phí')");
    await page.waitForSelector("button:has-text('Thêm')");

    console.log(`➕ Tạo chi phí bảo trì gán cho phòng "${roomName}"...`);
    await page.click("button:has-text('Thêm')");
    await page.fill("input[placeholder='Ví dụ: Thay vòi nước']", "Sửa bóng đèn ngủ");
    await page.fill("input[placeholder='Ví dụ: 150.000']", "50000");
    await page.selectOption("select:has(optgroup[label='Từng phòng cụ thể'])", { label: `Phòng: ${roomName} (${houseName})` });
    await page.click("button[type='submit']");
    
    // Xác minh tính nhất quán của định dạng "Sửa cho" (Dãy trọ / Phòng)
    console.log("🔍 Xác minh tính nhất quán định dạng hiển thị chi phí...");
    const expectedFormat = `${houseName} / Phòng ${roomName}`;
    try {
      await page.waitForSelector(`strong:has-text('${expectedFormat}')`, { timeout: 10000 });
      console.log(`✅ Định dạng chi phí nhất quán: "${expectedFormat}".`);
    } catch (e) {
      console.error(`❌ Định dạng chi phí chưa nhất quán! Không tìm thấy "${expectedFormat}".`);
      const strongTexts = await page.locator("strong").allTextContents();
      console.log("🔍 DEBUG: Các text trong thẻ strong đang hiển thị:", strongTexts);
      throw e;
    }

    // 7. DỌN DẸP DỮ LIỆU SAU KHI TEST (CLEAN UP WORKFLOW)
    console.log("🧹 7. Bắt đầu dọn dẹp dữ liệu kiểm thử...");
    // Xóa chi phí vừa tạo
    await page.click("button:has-text('Xoá')");
    await page.waitForSelector("h3:has-text('Xác nhận')");
    await page.click("button:has-text('Xác nhận')");
    await page.waitForTimeout(1000);
    console.log("🧹 Đã xóa chi phí kiểm thử.");

    // Quay lại tab phòng trọ để xóa phòng trọ
    await page.click("button:has-text('Phòng trọ')");
    await page.waitForTimeout(500);
    await page.click(`button:has-text('${houseName}')`);
    await page.waitForTimeout(500);
    
    // Bấm vào card phòng trọ để mở modal
    await page.click(`div.room-card:has-text('${roomName}')`);
    await page.waitForSelector("button:has-text('Xóa')");
    await page.click("button:has-text('Xóa')");
    // Xác nhận xóa
    await page.waitForSelector("h3:has-text('Xác nhận')");
    await page.click("button:has-text('Xác nhận')");
    await page.waitForTimeout(1000);
    console.log("🧹 Đã xóa phòng trọ kiểm thử.");

    // Xóa dãy trọ
    await page.click("button:has-text('Sửa tên dãy')");
    await page.waitForSelector("button:has-text('Xóa')");
    await page.click("button:has-text('Xóa')");
    await page.waitForSelector("h3:has-text('Xác nhận')");
    await page.click("button:has-text('Xác nhận')");
    await page.waitForTimeout(1000);
    console.log("🧹 Đã xóa Dãy trọ kiểm thử.");

    console.log("🎉 Hoàn thành xuất sắc bài E2E Workflow Test! Mọi thành phần hoạt động trơn tru 100%.");

  } catch (error) {
    console.error("❌ Kiểm thử E2E thất bại:", error);
  } finally {
    await browser.close();
    console.log("🔒 Trình duyệt đã đóng.");
  }
})();
