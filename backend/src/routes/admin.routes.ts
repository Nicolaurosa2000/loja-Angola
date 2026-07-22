import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { CategoryController } from "../controllers/category.controller";
import { ProductController } from "../controllers/product.controller";
import { BrandController } from "../controllers/brand.controller";
import { AdminOrderController } from "../controllers/admin-order.controller";
import { AdminCouponController } from "../controllers/admin-coupon.controller";
import { AdminBannerController } from "../controllers/admin-banner.controller";
import { AdminSettingsController } from "../controllers/admin-settings.controller";
import { AdminCustomerController } from "../controllers/admin-customer.controller";
import { AdminDashboardController } from "../controllers/admin-dashboard.controller";
import { AdminReportController } from "../controllers/admin-report.controller";
import { AdminUserController } from "../controllers/admin-user.controller";
import { AdminReviewController } from "../controllers/admin-review.controller";
import { AdminNewsletterController } from "../controllers/admin-newsletter.controller";
import { AdminFinanceController } from "../controllers/admin-finance.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../dto/category.dto";
import { createProductSchema, updateProductSchema } from "../dto/product.dto";
import { createBrandSchema, updateBrandSchema } from "../dto/brand.dto";
import {
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../dto/admin.dto";
import { createCouponSchema, updateCouponSchema } from "../dto/coupon.dto";
import { createBannerSchema, updateBannerSchema } from "../dto/banner.dto";
import { createSettingSchema, updateSettingSchema } from "../dto/settings.dto";

const router = Router();

router.use(authenticate, authorize("ADMIN", "STAFF"));

const categoryCtrl = new CategoryController();
const productCtrl = new ProductController();
const brandCtrl = new BrandController();
const adminOrderCtrl = new AdminOrderController();
const couponCtrl = new AdminCouponController();
const bannerCtrl = new AdminBannerController();
const settingsCtrl = new AdminSettingsController();
const customerCtrl = new AdminCustomerController();
const dashboardCtrl = new AdminDashboardController();
const userCtrl = new AdminUserController();
const reviewCtrl = new AdminReviewController();
const reportCtrl = new AdminReportController();
const newsletterCtrl = new AdminNewsletterController();
const financeCtrl = new AdminFinanceController();

// Categories
router.get("/categories", categoryCtrl.paginate);
router.get("/categories/:id", categoryCtrl.findById);
router.post("/categories", validate(createCategorySchema), categoryCtrl.create);
router.put(
  "/categories/:id",
  validate(updateCategorySchema),
  categoryCtrl.update,
);
router.delete("/categories/:id", categoryCtrl.delete);

// Products
router.get("/products", productCtrl.findAll);
router.get("/products/:id", productCtrl.findById);
router.post("/products", validate(createProductSchema), productCtrl.create);
router.put("/products/:id", validate(updateProductSchema), productCtrl.update);
router.delete("/products/:id", productCtrl.delete);

// Brands
router.get("/brands", brandCtrl.findAll);
router.get("/brands/:id", brandCtrl.findById);
router.post("/brands", validate(createBrandSchema), brandCtrl.create);
router.put("/brands/:id", validate(updateBrandSchema), brandCtrl.update);
router.delete("/brands/:id", brandCtrl.delete);

// Orders
router.get("/orders", adminOrderCtrl.findAll);
router.get("/orders/:id", adminOrderCtrl.findById);
router.patch(
  "/orders/:id/status",
  validate(updateOrderStatusSchema),
  adminOrderCtrl.updateStatus,
);
router.patch(
  "/orders/:id/payment",
  validate(updatePaymentStatusSchema),
  adminOrderCtrl.updatePayment,
);

// Dashboard
router.get("/dashboard/overview", dashboardCtrl.getOverview);
router.get("/dashboard/recent-orders", dashboardCtrl.recentOrders);
router.get("/dashboard/top-products", dashboardCtrl.topProducts);
router.get("/dashboard/sales", dashboardCtrl.salesByPeriod);

// Finance
router.get("/finance/overview", financeCtrl.overview);
router.get("/finance/transactions", financeCtrl.transactions);

// Coupons
router.get("/coupons", couponCtrl.findAll);
router.get("/coupons/:id", couponCtrl.findById);
router.post("/coupons", validate(createCouponSchema), couponCtrl.create);
router.put("/coupons/:id", validate(updateCouponSchema), couponCtrl.update);
router.delete("/coupons/:id", couponCtrl.delete);

// Banners
router.get("/banners", bannerCtrl.findAll);
router.get("/banners/:id", bannerCtrl.findById);
router.post("/banners", validate(createBannerSchema), bannerCtrl.create);
router.put("/banners/:id", validate(updateBannerSchema), bannerCtrl.update);
router.delete("/banners/:id", bannerCtrl.delete);

// Settings
router.get("/settings", settingsCtrl.findAll);
router.get("/settings/:id", settingsCtrl.findById);
router.get("/settings/key/:key", settingsCtrl.findByKey);
router.post("/settings", validate(createSettingSchema), settingsCtrl.create);
router.put("/settings/:id", validate(updateSettingSchema), settingsCtrl.update);

// Customers
router.get("/customers", customerCtrl.findAll);
router.get("/customers/:id", customerCtrl.findById);
router.patch("/customers/:id/toggle-active", customerCtrl.toggleActive);

// Users (Staff/Admin management)
router.get("/users", userCtrl.findAll);
router.get("/users/:id", userCtrl.findById);
router.post("/users", userCtrl.create);
router.put("/users/:id", userCtrl.update);
router.delete("/users/:id", userCtrl.delete);
router.patch("/users/:id/toggle-active", userCtrl.toggleActive);

// Reviews
router.get("/reviews", reviewCtrl.findAll);
router.get("/reviews/:id", reviewCtrl.findById);
router.patch("/reviews/:id/status", reviewCtrl.updateStatus);

// Newsletter
router.get("/newsletter", newsletterCtrl.findAll);
router.get("/newsletter/:id", newsletterCtrl.findById);
router.delete("/newsletter/:id", newsletterCtrl.delete);

// Reports
router.get("/reports/product-sales", reportCtrl.productSales);
router.get("/reports/customer-orders", reportCtrl.customerOrders);
router.get("/reports/daily-sales", reportCtrl.dailySales);
router.get("/reports/payment-methods", reportCtrl.paymentMethods);
router.get("/reports/stock", reportCtrl.stockReport);

export default router;
