# 📐 Tactile Design System: Usage Guide

This system uses **Physics-Based UI** principles. Instead of flat blocks, elements are treated as "physical" objects with depth and lighting.

## 1. The Core Utility Classes

Add these directly to your elements for instant tactile physics:

| Class | Appearance | Usage |
| :--- | :--- | :--- |
| `.btn-tactile` | **Protruding (Convex)** | Use for any clickable Action/Button. |
| `.input-tactile` | **Recessed (Concave)** | Use for any Form Input or Text Area. |
| `.panel-tactile` | **Levitating** | Use for Cards or Containers that sit "above" the canvas. |

### Example usage:
```tsx
<input className="input-tactile" placeholder="Type here..." />
<button className="btn-tactile">Forged Identity</button>
```

## 2. Shadow Tokens (Tailwind)

If you need custom depth, use these shadow tokens:

- `shadow-levitate`: For larger containers (soft, distant shadow).
- `shadow-concave`: For "milled" or "carved" slots (inner shadows).
- `shadow-convex`: For "raised" or "cast" objects (outer shadows).

## 3. The Color Palette

| Token | Name | Value | Logic |
| :--- | :--- | :--- | :--- |
| `tactile-canvas` | Cool Clay | `#F3F4F7` | The primary background surface. |
| `tactile-text` | Gunmetal | `#2D3436` | Primary body text. |
| `tactile-leaf` | Grey Blue | `#4f5f76` | Secondary labels and subtle UI. |
| `tactile-sage` | Glass Sage | `#E3F0AF` | Success, Active points, and Highlights. |

## 4. The "Light Source" Rule
Our light always comes from the **Top-Left**. 
- Top-Left of an object should have a light highlight (`#FFFFFF`).
- Bottom-Right of an object should have a soft shadow (`rgba(0,0,0,0.05)`).

---
*Stay Sharp. Stay Sovereign.* 🔱🧱
