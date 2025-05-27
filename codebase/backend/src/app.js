"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./docs/swagger"));
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const labResult_route_1 = __importDefault(require("./routes/labResult.route"));
const rescptions_route_1 = __importDefault(require("./routes/rescptions.route"));
const doctor_route_1 = __importDefault(require("./routes/doctor.route"));
const superadmin_route_1 = __importDefault(require("./routes/superadmin.route"));
const radiologist_route_1 = __importDefault(require("./routes/radiologist.route"));
const pharmacy_route_1 = __importDefault(require("./routes/pharmacy.route"));
const app = (0, express_1.default)();
// Security and middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Documentation
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/lab", labResult_route_1.default);
app.use("/api/reception", rescptions_route_1.default);
app.use("/api/doctor", doctor_route_1.default);
app.use("/api/superadmin", superadmin_route_1.default);
app.use("/api/radiology", radiologist_route_1.default);
app.use("/api/pharmacy", pharmacy_route_1.default);
// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Admin APIs");
});
exports.default = app;
