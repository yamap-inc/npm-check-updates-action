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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.formatAsColumns = exports.getItemRow = exports.hasMajorUpdate = exports.getLinkableName = exports.convertToPackages = exports.executeOutdated = exports.getOutdatedPackagesByYarn = exports.getOutdatedPackagesByNpm = exports.parseYarnOutdatedJSON = void 0;
var core = require("@actions/core");
var exec_1 = require("@actions/exec");
var os_1 = require("os");
// @see https://github.com/masawada/yarn-outdated-formatter/blob/main/lib/parseYarnOutdatedJSON.js
var parseYarnOutdatedJSON = function (jsonString) {
    // yarn <= 1.0.2
    try {
        var json = JSON.parse(jsonString);
        return json;
    }
    catch (e) { } // eslint-disable-line no-empty
    // yarn >= 1.2.1
    // try parsing multiple context json string
    var tokens = '';
    for (var _i = 0, _a = jsonString.split(os_1["default"].EOL); _i < _a.length; _i++) {
        var token = _a[_i];
        tokens += token;
        try {
            var json = JSON.parse(tokens);
            if (json.type === 'table') {
                return json;
            }
            tokens = '';
        }
        catch (e) { } // eslint-disable-line no-empty
    }
    return null;
};
exports.parseYarnOutdatedJSON = parseYarnOutdatedJSON;
var getOutdatedPackagesByNpm = function (jsonString) {
    var json = JSON.parse(jsonString);
    return Object.keys(json).map(function (key) {
        var _a = json[key], current = _a.current, wanted = _a.wanted, latest = _a.latest, homepage = _a.homepage;
        return { name: key, current: current, wanted: wanted, latest: latest, homepage: homepage };
    });
};
exports.getOutdatedPackagesByNpm = getOutdatedPackagesByNpm;
var getOutdatedPackagesByYarn = function (jsonString) {
    var json = exports.parseYarnOutdatedJSON(jsonString);
    if (!json)
        throw new Error('Failed to parse yarn outdated JSON');
    delete json.type;
    delete json.data.head;
    return json.data.body.map(function (item) {
        var name = item[0], current = item[1], wanted = item[2], latest = item[3], homepage = item[5];
        return { name: name, current: current, wanted: wanted, latest: latest, homepage: homepage };
    });
};
exports.getOutdatedPackagesByYarn = getOutdatedPackagesByYarn;
var executeOutdated = function (options) {
    if (options === void 0) { options = {
        packageManager: 'npm'
    }; }
    return __awaiter(void 0, void 0, void 0, function () {
        var stdout, workingDir, execOptions, args, args, packages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stdout = '';
                    workingDir = core.getInput('path');
                    execOptions = {
                        cwd: workingDir || './',
                        ignoreReturnCode: true,
                        listeners: {
                            stdout: function (data) {
                                stdout += data.toString();
                            }
                        }
                    };
                    if (!(options.packageManager === 'yarn')) return [3 /*break*/, 2];
                    args = ['--json'];
                    return [4 /*yield*/, exec_1.exec('yarn outdated', args, execOptions)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    args = ['--long', '--json'];
                    return [4 /*yield*/, exec_1.exec('npm outdated', args, execOptions)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (stdout.trim().length === 0) {
                        return [2 /*return*/, []];
                    }
                    if (options.packageManager === 'yarn') {
                        packages = exports.getOutdatedPackagesByYarn(stdout);
                        return [2 /*return*/, packages];
                    }
                    else {
                        return [2 /*return*/, exports.getOutdatedPackagesByNpm(stdout)];
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports.executeOutdated = executeOutdated;
var convertToPackages = function (outdatedPackages) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, outdatedPackages.map(function (_a) {
                var name = _a.name, current = _a.current, latest = _a.latest, homepage = _a.homepage;
                return { name: name, from: current, to: latest, url: homepage };
            })];
    });
}); };
exports.convertToPackages = convertToPackages;
var getLinkableName = function (_a) {
    var name = _a.name, url = _a.url;
    return "[" + name + "](" + url + ")";
};
exports.getLinkableName = getLinkableName;
var hasMajorUpdate = function (_a) {
    var from = _a.from, to = _a.to;
    var fromMajorVer = parseInt(from.split('.')[0]);
    var toMajorVer = parseInt(to.split('.')[0]);
    return toMajorVer > fromMajorVer;
};
exports.hasMajorUpdate = hasMajorUpdate;
var getItemRow = function (pkg) {
    var linkableName = exports.getLinkableName(pkg);
    if (exports.hasMajorUpdate(pkg)) {
        linkableName = ":warning: " + linkableName;
    }
    return "| " + linkableName + " | " + pkg.from + " | " + pkg.to + " |";
};
exports.getItemRow = getItemRow;
var formatAsColumns = function (packages) { return __awaiter(void 0, void 0, void 0, function () {
    var keys, headerRow, alignRow, itemRows;
    return __generator(this, function (_a) {
        if (packages.length === 0) {
            return [2 /*return*/, ''];
        }
        keys = Object.keys(packages[0]).filter(function (key) { return key !== 'url'; });
        headerRow = "| " + keys.join('|') + " |";
        alignRow = "| " + keys.map(function () { return ':--'; }).join('|') + " |";
        itemRows = packages.map(function (pkg) { return exports.getItemRow(pkg); });
        return [2 /*return*/, __spreadArray([headerRow, alignRow], itemRows).join(os_1["default"].EOL)];
    });
}); };
exports.formatAsColumns = formatAsColumns;
