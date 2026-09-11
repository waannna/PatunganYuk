// src/components/ui/index.jsx
import { useState } from 'react';
import { Eye, EyeOff, Loader2, X, Plus, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Skeleton, SkeletonCard, SkeletonTransaction, SkeletonChart } from './Skeleton';
import { Confetti } from './Confetti';
import { TrendChart } from './TrendChart';
import { NotifPopup } from './NotifPopup';

// ==================== RECEIPT DIVIDER ====================
export function ReceiptDivider({ double = false }) {
  return (
    <div className="my-3">
      {double ? (
        <div className="border-t-2 border-b border-dashed border-stone-300 h-1" />
      ) : (
        <div className="border-t border-dashed border-stone-300" />
      )}
    </div>
  );
}

// ==================== RECEIPT HEADER ====================
export function ReceiptHeader({ title, subtitle, center = true }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <h1 className="receipt-title text-lg tracking-widest">{title}</h1>
      {subtitle && (
        <p className="receipt-label mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ==================== CARD (RECEIPT PAPER) ====================
export function Card({ children, className = '', padding = 'p-5', hover = false, border = true }) {
  return (
    <div className={`
      receipt-paper receipt-shadow
      ${border ? 'border border-stone-300/60' : ''}
      ${padding}
      ${hover ? 'hover:shadow-lg hover:border-stone-400/60 transition-all' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

// ==================== BUTTON (RECEIPT STYLE) ====================
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button', 
  className = '', 
  icon: Icon, 
  iconPosition = 'left', 
  fullWidth = false, 
  ...props 
}) {
  const variants = {
    primary: 'bg-stone-900 hover:bg-stone-800 text-amber-50 border border-stone-900',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300',
    outline: 'bg-transparent hover:bg-stone-100 text-stone-700 border border-dashed border-stone-400',
    danger: 'bg-red-800 hover:bg-red-900 text-amber-50 border border-red-900',
    success: 'bg-emerald-800 hover:bg-emerald-900 text-amber-50 border border-emerald-900',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-600 border border-transparent',
  };
  
  const sizes = { 
    sm: 'px-3 py-1.5 text-[11px] tracking-wider', 
    md: 'px-4 py-2 text-xs tracking-wider', 
    lg: 'px-6 py-2.5 text-sm tracking-wider' 
  };
  
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`
        inline-flex items-center justify-center gap-2 font-mono font-bold uppercase
        transition-all duration-150
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}
        disabled:opacity-40 disabled:cursor-not-allowed 
        active:translate-y-[1px]
        ${className}
      `} 
      {...props}
    >
      {loading ? (
        <><Loader2 size={14} className="animate-spin" />{children}</>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={14} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={14} />}
        </>
      )}
    </button>
  );
}

// ==================== INPUT (RECEIPT STYLE) ====================
export function Input({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false, 
  disabled = false, 
  icon: Icon, 
  className = '', 
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="receipt-label block">
          {label} {required && <span className="text-red-700">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            <Icon size={16} />
          </div>
        )}
        <input 
          type={inputType} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
          disabled={disabled} 
          className={`
            w-full 
            ${Icon ? 'pl-9' : 'pl-3'} 
            ${isPassword ? 'pr-10' : 'pr-3'} 
            py-2.5 
            bg-white/70 border-2 border-dashed
            font-mono text-sm text-stone-900
            focus:border-stone-600 focus:border-solid focus:outline-none
            placeholder:text-stone-400 placeholder:italic
            transition-all
            ${error ? 'border-red-400' : 'border-stone-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''} 
            ${className}
          `} 
          {...props} 
        />
        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-red-700 font-mono uppercase tracking-wider">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// ==================== SELECT (RECEIPT STYLE) ====================
export function Select({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = '-- PILIH --', 
  error, 
  required = false, 
  disabled = false, 
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="receipt-label block">
          {label} {required && <span className="text-red-700">*</span>}
        </label>
      )}
      <select 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        className={`
          w-full px-3 py-2.5 
          bg-white/70 border-2 border-dashed
          font-mono text-sm text-stone-900
          focus:border-stone-600 focus:border-solid focus:outline-none
          transition-all appearance-none
          ${error ? 'border-red-400' : 'border-stone-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''} 
          ${className}
        `} 
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] text-red-700 font-mono uppercase tracking-wider">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// ==================== BADGE (RECEIPT STYLE) ====================
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-stone-200 text-stone-700 border-stone-300',
    primary: 'bg-stone-900 text-amber-50 border-stone-900',
    success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    danger: 'bg-red-100 text-red-900 border-red-300',
    warning: 'bg-amber-100 text-amber-900 border-amber-300',
    info: 'bg-blue-100 text-blue-900 border-blue-300',
  };
  const sizes = { 
    sm: 'text-[9px] px-1.5 py-0.5', 
    md: 'text-[10px] px-2 py-0.5', 
    lg: 'text-[11px] px-2.5 py-1' 
  };
  return (
    <span className={`
      inline-flex items-center font-mono font-bold uppercase tracking-wider 
      border ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  );
}

// ==================== AVATAR (RECEIPT STYLE) ====================
export function Avatar({ name, size = 'md', imageUrl, className = '' }) {
  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const sizes = { 
    sm: 'w-8 h-8 text-[10px]', 
    md: 'w-10 h-10 text-xs', 
    lg: 'w-12 h-12 text-sm', 
    xl: 'w-16 h-16 text-base' 
  };
  
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`object-cover border-2 border-stone-400 ${sizes[size]} ${className}`} />;
  }
  return (
    <div className={`
      flex items-center justify-center font-mono font-bold uppercase
      bg-stone-800 text-amber-50 border-2 border-stone-900
      ${sizes[size]} ${className}
    `}>
      {getInitials(name)}
    </div>
  );
}

// ==================== LOADING SPINNER (RECEIPT STYLE) ====================
export function LoadingSpinner({ size = 'md', message = '' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-dashed border-stone-400 border-t-stone-900 rounded-full animate-spin`} />
      {message && (
        <p className="receipt-label">{message}</p>
      )}
    </div>
  );
}

// ==================== EMPTY STATE (RECEIPT STYLE) ====================
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto border-2 border-dashed border-stone-400 flex items-center justify-center mb-4">
        {Icon && <Icon size={28} className="text-stone-500" />}
      </div>
      <h3 className="receipt-title text-base mb-2">{title}</h3>
      <p className="receipt-label mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={Plus}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ==================== PROGRESS BAR (RECEIPT STYLE) ====================
export function ProgressBar({ value, max = 100, label, color = 'ink', size = 'md', className = '' }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    ink: 'bg-stone-900',
    emerald: 'bg-emerald-700',
    red: 'bg-red-700',
    amber: 'bg-amber-600',
  };
  
  const sizes = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5', xl: 'h-3' };
  
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="receipt-label">{label}</span>
          <span className="font-mono text-xs font-bold text-stone-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-stone-200 border border-stone-300 overflow-hidden ${sizes[size]}`}>
        <div 
          className={`${colors[color]} h-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

// ==================== TOGGLE (RECEIPT STYLE) ====================
export function Toggle({ checked, onChange, label, disabled = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button 
        type="button" 
        onClick={() => !disabled && onChange(!checked)} 
        disabled={disabled} 
        className={`
          relative inline-flex h-6 w-11 border-2 transition-colors
          ${checked ? 'bg-stone-900 border-stone-900' : 'bg-stone-200 border-stone-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className={`
          inline-block h-4 w-4 bg-amber-50 transition-transform mt-0.5
          ${checked ? 'translate-x-6' : 'translate-x-0.5'}
        `} />
      </button>
      {label && (
        <span className={`font-mono text-sm ${disabled ? 'text-stone-400' : 'text-stone-700'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

// ==================== TABS (RECEIPT STYLE) ====================
export function Tabs({ tabs, defaultTab, onChange, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const handleChange = (id) => { setActiveTab(id); if (onChange) onChange(id); };
  
  return (
    <div className={className}>
      <div className="flex gap-0 border-b-2 border-dashed border-stone-300">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => handleChange(tab.id)} 
            className={`
              pb-2 px-4 font-mono text-xs font-bold uppercase tracking-wider
              border-b-2 -mb-0.5 transition-all
              ${activeTab === tab.id 
                ? 'border-stone-900 text-stone-900' 
                : 'border-transparent text-stone-400 hover:text-stone-700'}
            `}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className={`
                ml-2 text-[9px] px-1.5 py-0.5 border
                ${activeTab === tab.id 
                  ? 'bg-stone-900 text-amber-50 border-stone-900' 
                  : 'bg-stone-100 text-stone-500 border-stone-300'}
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs.find(t => t.id === activeTab)?.content}</div>
    </div>
  );
}

// ==================== EXPORT ====================
export {
  Skeleton,
  SkeletonCard,
  SkeletonTransaction,
  SkeletonChart,
  Confetti,
  TrendChart,
  NotifPopup,
};

export default {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  LoadingSpinner,
  EmptyState,
  ProgressBar,
  Toggle,
  Tabs,
  ReceiptDivider,
  ReceiptHeader,
  Skeleton,
  SkeletonCard,
  SkeletonTransaction,
  SkeletonChart,
  Confetti,
  TrendChart,
  NotifPopup,
};