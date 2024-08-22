"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forbidden = exports.CustomError = exports.BadRequest = exports.NotFound = exports.UnAuthenticated = void 0;
const custom_error_1 = __importDefault(require("./custom-error"));
exports.CustomError = custom_error_1.default;
const not_found_1 = __importDefault(require("./not-found"));
exports.NotFound = not_found_1.default;
const unauthenticated_1 = __importDefault(require("./unauthenticated"));
exports.UnAuthenticated = unauthenticated_1.default;
const bad_request_1 = __importDefault(require("./bad-request"));
exports.BadRequest = bad_request_1.default;
const forbidden_1 = __importDefault(require("./forbidden"));
exports.Forbidden = forbidden_1.default;
