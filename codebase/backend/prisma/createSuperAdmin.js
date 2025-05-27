"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = 'superadmin@example.com';
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.log('❗ Superadmin already exists.');
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash('supersecure123', 10);
        const person = yield prisma.person.create({
            data: {
                firstName: 'Super',
                middleName: 'Admin',
                lastName: 'User',
                sex: 'Male',
                dob: new Date('1980-01-01'),
                phoneNumber: '1234567890',
                address: 'Admin HQ',
            },
        });
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "SUPERADMIN",
                personId: person.id,
            },
        });
        console.log('✅ Superadmin created:', user);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
