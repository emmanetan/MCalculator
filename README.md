# MCalculator

A modern, feature-rich calculator web application with a clean interface and intuitive user experience.

## Features

### Core Functionality
- **Basic Operations**: Addition, subtraction, multiplication, and division
- **Decimal Support**: Perform calculations with decimal numbers
- **Parentheses**: Support for complex expressions using parentheses
- **Percentage Calculations**: Quick percentage conversions
- **Sign Toggle**: Switch between positive and negative numbers
- **Live Result Preview**: See real-time calculation results as you type

### User Interface
- **Dark/Light Theme**: Toggle between dark and light modes with persistent settings
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean Visual Design**: Modern UI with smooth animations and transitions
- **Number Formatting**: Automatic comma separation for large numbers (e.g., 1,000,000)

### Advanced Features
- **Calculation History**: 
  - View all previous calculations
  - Persistent history using localStorage
  - Clear history with confirmation modal
  - Click on history items to reuse them
- **Custom Modal System**: Elegant confirmation dialogs for destructive actions
- **Error Handling**: User-friendly error messages for invalid calculations
- **Maximum Precision**: Supports up to 15 digits for accurate calculations
- **Smart Input**: Automatic multiplication when number follows closing parenthesis

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Custom properties for theming, flexbox/grid layouts, and animations
- **JavaScript (ES6+)**: Vanilla JavaScript with modern syntax
- **LocalStorage API**: For persistent theme and history storage

## File Structure

```
MCalculator/
├── index.html          # Main HTML structure
├── script.js           # Calculator logic and functionality
├── style.css           # Styling and theme definitions
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional dependencies or build tools required

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/emmanetan/mcalculator.git
   ```

2. Navigate to the project directory:
   ```bash
   cd MCalculator
   ```

3. Open `index.html` in your web browser:
   - Double-click the file, or
   - Right-click and select "Open with" your preferred browser, or
   - Use a local development server

### Usage

1. **Basic Calculations**:
   - Click number buttons to input values
   - Use operator buttons (+, −, ×, ÷) for operations
   - Press `=` to calculate the result

2. **Advanced Operations**:
   - Click `()` to add parentheses (automatically determines opening or closing)
   - Use `%` to convert a number to percentage
   - Click `+/−` to toggle between positive and negative
   - Press `.` to add decimal points

3. **Theme Toggle**:
   - Click the toggle switch in the top-right corner
   - Theme preference is saved automatically

4. **History Panel**:
   - Click the clock icon to open/close history
   - Click any history item to reuse that calculation
   - Click "Clear" to remove all history (with confirmation)

5. **Clear**:
   - Press `C` to clear the current calculation and start fresh

## Features in Detail

### Token-Based Expression System
The calculator uses a sophisticated token-based parsing system that:
- Validates expressions in real-time
- Handles operator precedence correctly
- Manages parentheses balancing
- Prevents invalid input combinations

### Smart Number Formatting
- Automatically adds commas for thousands separators
- Displays results in scientific notation for very large/small numbers
- Limits display to 15 significant digits
- Handles trailing zeros appropriately

### Error Prevention
- Maximum digit limit prevents overflow
- Validates expressions before evaluation
- Prevents division by zero
- Handles malformed expressions gracefully

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Contributing

Contributions are welcome! If you'd like to improve MCalculator:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

© 2025 emmanetan. All rights reserved.

## Contact

- **GitHub**: [@emmanetan](https://github.com/emmanetan)
- **Facebook**: [emmannnnn283](https://web.facebook.com/emmannnnn283)
- **Instagram**: [@etan.emman](https://www.instagram.com/etan.emman/)
- **LinkedIn**: [emmanetan](https://linkedin.com/in/emmanetan)

## Acknowledgments

- Inspired by modern calculator designs
- Icons are inline SVG for optimal performance
- Uses system fonts for best native appearance

---

**Enjoy calculating!** 🧮
