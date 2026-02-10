# 🎭 HP MOOD - Premium Emotion Monitor

A modern, minimalist mental health and wellness dashboard with AI-powered mood tracking, journaling, and breathing exercises.

---

## 📁 Project Structure

```
mood-tracker-app/
├── index.html                  # Main entry point
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── css/                        # Stylesheets
│   ├── style.css              # Main styles (Desktop & Base)
│   └── responsive.css         # Mobile/Tablet responsive styles
│
├── js/                         # JavaScript files
│   ├── app.js                 # Main application logic
│   └── breath.js              # Breathing exercise logic
│
├── img/                        # Images & assets
│   └── (image files)
│
└── docs/                       # Documentation
    ├── HAMBURGER_MENU_REFACTOR.md      # Hamburger menu implementation
    ├── MOBILE_FIX_SUMMARY.md           # Mobile responsive fixes (archived)
    ├── TESTING_GUIDE.md                # Visual testing guide (archived)
    └── mobile-fixes-reference.css      # CSS reference snippets (archived)
```

---

## 🚀 Quick Start

### Development
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mood-tracker-app
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - No build process needed (pure HTML/CSS/JS)

3. **For Live Server (Optional)**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using VS Code Live Server extension
   Right-click index.html → "Open with Live Server"
   ```

---

## ✨ Features

### 🎯 Core Features
- **Mood Scanner**: AI-powered facial expression analysis
- **Emotion Trends**: Track your emotional patterns over time
- **Journal**: Private digital diary for your thoughts
- **Vision Board**: Collection of hopes and encouragements
- **Breath Art**: Interactive breathing exercises
- **Profile Settings**: Customize your experience

### 📱 Mobile Experience
- **Hamburger Menu**: Off-canvas sidebar navigation
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: 44x44px minimum touch targets
- **Smooth Animations**: GPU-accelerated transitions

### 🎨 Design
- **Minimalist UI**: Clean, professional aesthetic
- **Glassmorphism**: Modern blur effects
- **Gen Z Friendly**: Empathetic, supportive tone
- **Premium Feel**: High-quality visual design

---

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Icons**: Lucide Icons
- **Fonts**: Google Fonts (Outfit)
- **No Framework**: Lightweight & fast

---

## 📂 File Organization

### CSS Files
- **`css/style.css`**: 
  - Base styles, variables, typography
  - Desktop layout & components
  - Sidebar, cards, forms, buttons
  
- **`css/responsive.css`**: 
  - Tablet breakpoint (≤1024px)
  - Mobile breakpoint (≤768px)
  - Hamburger menu system
  - Off-canvas sidebar

### JavaScript Files
- **`js/app.js`**: 
  - Main app logic & state management
  - Navigation system
  - Data persistence (localStorage)
  - User authentication flow
  
- **`js/breath.js`**: 
  - Breathing exercise timer
  - Canvas animations
  - Audio feedback

### Documentation
- **`docs/HAMBURGER_MENU_REFACTOR.md`**: 
  - Implementation details of the hamburger menu
  - CSS & JS code references
  - Testing checklist
  
- **Archived Docs** (for reference):
  - `MOBILE_FIX_SUMMARY.md`: Old bottom nav fixes
  - `TESTING_GUIDE.md`: Mobile testing guide
  - `mobile-fixes-reference.css`: CSS snippets

---

## 🧪 Testing

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (Not supported)

### Responsive Breakpoints
- **Desktop**: >1024px
- **Tablet**: 768px - 1024px
- **Mobile**: ≤768px
- **Small Mobile**: ≤480px

### Testing Guide
See `docs/TESTING_GUIDE.md` for detailed testing procedures.

---

## 📝 Development Notes

### CSS Architecture
- **Mobile-First Approach**: Base styles for mobile, enhanced for desktop
- **CSS Variables**: Centralized theming in `:root`
- **BEM Methodology**: Block__Element--Modifier naming
- **Utility Classes**: `.glass`, `.card`, `.btn-primary`, etc.

### JavaScript Patterns
- **Module Pattern**: IIFE for encapsulation
- **Event Delegation**: Efficient event handling
- **LocalStorage API**: Client-side data persistence
- **Vanilla JS**: No jQuery or frameworks

### Code Style
- **Indentation**: 4 spaces
- **Naming**: camelCase for JS, kebab-case for CSS
- **Comments**: Inline for complex logic, block for sections
- **Formatting**: Consistent across all files

---

## 🐛 Known Issues

None currently. App is production-ready! 🎉

---

## 🔮 Future Enhancements

- [ ] Dark mode toggle
- [ ] Multiple language support (i18n)
- [ ] Export data to PDF/JSON
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Progressive Web App (PWA)
- [ ] Offline mode with Service Workers
- [ ] Advanced analytics dashboard

---

## 📄 License

This project is for educational/portfolio purposes.

---

## 👤 Author

**Developer**: [Your Name]  
**Date**: February 2026  
**Version**: 1.0.0

---

## 🙏 Acknowledgments

- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)
- **Inspiration**: Modern mental health apps

---

## 📞 Support

For issues or questions, please refer to the documentation in the `docs/` folder.

---

**Built with ❤️ for mental wellness**
