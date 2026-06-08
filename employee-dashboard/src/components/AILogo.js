import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const AILogo = ({ size = 48, glow = false }) => {
  const { colorTheme, colorThemes } = useTheme();
  const themeData = colorThemes[colorTheme] || colorThemes.blue;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: themeData.gradient,
        boxShadow: glow ? `0 0 ${size * 0.4}px ${themeData.glow}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 800,
        fontSize: size * 0.45,
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
          backgroundSize: '200% 200%'
        }}
      />
      <span style={{ zIndex: 1, letterSpacing: -1 }}>AI</span>
    </motion.div>
  );
};

export default AILogo;
