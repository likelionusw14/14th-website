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
exports.DropdownMenu = DropdownMenu;
exports.DropdownMenuPortal = DropdownMenuPortal;
exports.DropdownMenuTrigger = DropdownMenuTrigger;
exports.DropdownMenuContent = DropdownMenuContent;
exports.DropdownMenuGroup = DropdownMenuGroup;
exports.DropdownMenuLabel = DropdownMenuLabel;
exports.DropdownMenuItem = DropdownMenuItem;
exports.DropdownMenuCheckboxItem = DropdownMenuCheckboxItem;
exports.DropdownMenuRadioGroup = DropdownMenuRadioGroup;
exports.DropdownMenuRadioItem = DropdownMenuRadioItem;
exports.DropdownMenuSeparator = DropdownMenuSeparator;
exports.DropdownMenuShortcut = DropdownMenuShortcut;
exports.DropdownMenuSub = DropdownMenuSub;
exports.DropdownMenuSubTrigger = DropdownMenuSubTrigger;
exports.DropdownMenuSubContent = DropdownMenuSubContent;
const React = __importStar(require("react"));
const menu_1 = require("@base-ui/react/menu");
const utils_1 = require("@/lib/utils");
const react_1 = require("@hugeicons/react");
const core_free_icons_1 = require("@hugeicons/core-free-icons");
function DropdownMenu({ ...props }) {
    return <menu_1.Menu.Root data-slot="dropdown-menu" {...props}/>;
}
function DropdownMenuPortal({ ...props }) {
    return <menu_1.Menu.Portal data-slot="dropdown-menu-portal" {...props}/>;
}
function DropdownMenuTrigger({ ...props }) {
    return <menu_1.Menu.Trigger data-slot="dropdown-menu-trigger" {...props}/>;
}
function DropdownMenuContent({ align = "start", alignOffset = 0, side = "bottom", sideOffset = 4, className, ...props }) {
    return (<menu_1.Menu.Portal>
      <menu_1.Menu.Positioner className="isolate z-50 outline-none" align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset}>
        <menu_1.Menu.Popup data-slot="dropdown-menu-content" className={(0, utils_1.cn)("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-md p-1 shadow-md ring-1 duration-100 z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden", className)} {...props}/>
      </menu_1.Menu.Positioner>
    </menu_1.Menu.Portal>);
}
function DropdownMenuGroup({ ...props }) {
    return <menu_1.Menu.Group data-slot="dropdown-menu-group" {...props}/>;
}
function DropdownMenuLabel({ className, inset, ...props }) {
    return (<menu_1.Menu.GroupLabel data-slot="dropdown-menu-label" data-inset={inset} className={(0, utils_1.cn)("text-muted-foreground px-2 py-1.5 text-xs font-medium data-[inset]:pl-8", className)} {...props}/>);
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
    return (<menu_1.Menu.Item data-slot="dropdown-menu-item" data-inset={inset} data-variant={variant} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}/>);
}
function DropdownMenuSub({ ...props }) {
    return <menu_1.Menu.SubmenuRoot data-slot="dropdown-menu-sub" {...props}/>;
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
    return (<menu_1.Menu.SubmenuTrigger data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      {children}
      <react_1.HugeiconsIcon icon={core_free_icons_1.ArrowRight01Icon} strokeWidth={2} className="ml-auto"/>
    </menu_1.Menu.SubmenuTrigger>);
}
function DropdownMenuSubContent({ align = "start", alignOffset = -3, side = "right", sideOffset = 0, className, ...props }) {
    return (<DropdownMenuContent data-slot="dropdown-menu-sub-content" className={(0, utils_1.cn)("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-md p-1 shadow-lg ring-1 duration-100 w-auto", className)} align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} {...props}/>);
}
function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
    return (<menu_1.Menu.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} checked={checked} {...props}>
      <span className="pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none" data-slot="dropdown-menu-checkbox-item-indicator">
        <menu_1.Menu.CheckboxItemIndicator>
          <react_1.HugeiconsIcon icon={core_free_icons_1.Tick02Icon} strokeWidth={2}/>
        </menu_1.Menu.CheckboxItemIndicator>
      </span>
      {children}
    </menu_1.Menu.CheckboxItem>);
}
function DropdownMenuRadioGroup({ ...props }) {
    return (<menu_1.Menu.RadioGroup data-slot="dropdown-menu-radio-group" {...props}/>);
}
function DropdownMenuRadioItem({ className, children, ...props }) {
    return (<menu_1.Menu.RadioItem data-slot="dropdown-menu-radio-item" className={(0, utils_1.cn)("focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>
      <span className="pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none" data-slot="dropdown-menu-radio-item-indicator">
        <menu_1.Menu.RadioItemIndicator>
          <react_1.HugeiconsIcon icon={core_free_icons_1.Tick02Icon} strokeWidth={2}/>
        </menu_1.Menu.RadioItemIndicator>
      </span>
      {children}
    </menu_1.Menu.RadioItem>);
}
function DropdownMenuSeparator({ className, ...props }) {
    return (<menu_1.Menu.Separator data-slot="dropdown-menu-separator" className={(0, utils_1.cn)("bg-border -mx-1 my-1 h-px", className)} {...props}/>);
}
function DropdownMenuShortcut({ className, ...props }) {
    return (<span data-slot="dropdown-menu-shortcut" className={(0, utils_1.cn)("text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest", className)} {...props}/>);
}
