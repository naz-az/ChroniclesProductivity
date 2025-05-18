import { useEffect } from 'react'
import MainLayout from './components/layouts/MainLayout'
import { useStore } from './store/useStore'

function SoltwinAi2() {
  const { theme } = useStore()
  
  // Apply theme to document
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';
    document.body.style.fontFamily = 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif';
    document.body.style.backgroundColor = theme === 'light' ? '#ffffff' : '#151515';
    document.body.style.color = theme === 'light' ? '#151515' : '#ffffff';
    document.body.style.transition = 'background-color 0.2s, color 0.2s';
    
    // For animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return (
    <MainLayout />
  )
}

export default SoltwinAi2
