"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertDialog = AlertDialog;
exports.AlertDialogAction = AlertDialogAction;
exports.AlertDialogCancel = AlertDialogCancel;
exports.AlertDialogContent = AlertDialogContent;
exports.AlertDialogDescription = AlertDialogDescription;
exports.AlertDialogFooter = AlertDialogFooter;
exports.AlertDialogHeader = AlertDialogHeader;
exports.AlertDialogMedia = AlertDialogMedia;
exports.AlertDialogOverlay = AlertDialogOverlay;
exports.AlertDialogPortal = AlertDialogPortal;
exports.AlertDialogTitle = AlertDialogTitle;
exports.AlertDialogTrigger = AlertDialogTrigger;
const React = __importStar(require("react"));
const alert_dialog_1 = require("@base-ui/react/alert-dialog");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
function AlertDialog({ ...props }) {
    return <alert_dialog_1.AlertDialog.Root data-slot="alert-dialog" {...props}/>;
}
function AlertDialogTrigger({ ...props }) {
    return (<alert_dialog_1.AlertDialog.Trigger data-slot="alert-dialog-trigger" {...props}/>);
}
function AlertDialogPortal({ ...props }) {
    return (<alert_dialog_1.AlertDialog.Portal data-slot="alert-dialog-portal" {...props}/>);
}
function AlertDialogOverlay({ className, ...props }) {
    return (<alert_dialog_1.AlertDialog.Backdrop data-slot="alert-dialog-overlay" className={(0, utils_1.cn)("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", className)} {...props}/>);
}
function AlertDialogContent({ className, size = "default", ...props }) {
    return (<AlertDialogPortal>
      <AlertDialogOverlay />
      <alert_dialog_1.AlertDialog.Popup data-slot="alert-dialog-content" data-size={size} className={(0, utils_1.cn)("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-6 rounded-xl p-6 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-lg group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none", className)} {...props}/>
    </AlertDialogPortal>);
}
function AlertDialogHeader({ className, ...props }) {
    return (<div data-slot="alert-dialog-header" className={(0, utils_1.cn)("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", className)} {...props}/>);
}
function AlertDialogFooter({ className, ...props }) {
    return (<div data-slot="alert-dialog-footer" className={(0, utils_1.cn)("flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end", className)} {...props}/>);
}
function AlertDialogMedia({ className, ...props }) {
    return (<div data-slot="alert-dialog-media" className={(0, utils_1.cn)("bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8", className)} {...props}/>);
}
function AlertDialogTitle({ className, ...props }) {
    return (<alert_dialog_1.AlertDialog.Title data-slot="alert-dialog-title" className={(0, utils_1.cn)("text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", className)} {...props}/>);
}
function AlertDialogDescription({ className, ...props }) {
    return (<alert_dialog_1.AlertDialog.Description data-slot="alert-dialog-description" className={(0, utils_1.cn)("text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3", className)} {...props}/>);
}
function AlertDialogAction({ className, ...props }) {
    return (<button_1.Button data-slot="alert-dialog-action" className={(0, utils_1.cn)(className)} {...props}/>);
}
function AlertDialogCancel({ className, variant = "outline", size = "default", ...props }) {
    return (<alert_dialog_1.AlertDialog.Close data-slot="alert-dialog-cancel" className={(0, utils_1.cn)(className)} render={<button_1.Button variant={variant} size={size}/>} {...props}/>);
}
