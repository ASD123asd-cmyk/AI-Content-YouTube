

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';


// --- STYLES ---
const GlobalStyles = () => {
    useEffect(() => {
        // FIX: Add a check for document to avoid errors in non-browser environments.
        if (typeof document === 'undefined') return;
        const style = document.createElement('style');
        style.textContent = `
:root {
  --font-family: 'Tajawal', sans-serif;
  --transition-speed: 0.3s;
  --transition-fast: 0.2s;
  
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-secondary: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  
  --text-light-1: #111827;
  --text-light-2: #374151;
  --text-light-3: #9ca3af;
  
  --text-dark-1: #f9fafb;
  --text-dark-2: #d1d5db;
  --text-dark-3: #9ca3af;
  
  --bg-light-1: #ffffff;
  --bg-light-2: #f9fafb;
  --bg-light-3: #f3f4f6;
  
  --bg-dark-1: #111827;
  --bg-dark-2: #1f2937;
  --bg-dark-3: #374151;
  
  --border-light: #e5e7eb;
  --border-dark: #374151;
}

[data-theme="light"] {
  --bg-main: var(--bg-light-2);
  --bg-content: var(--bg-light-1);
  --bg-header: var(--bg-light-1);
  --text-main: var(--text-light-1);
  --text-secondary: var(--text-light-2);
  --text-muted: var(--text-light-3);
  --border-color: var(--border-light);
  --shadow-color-light: rgba(0, 0, 0, 0.05);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --gradient-bg: linear-gradient(180deg, var(--bg-light-1) 0%, var(--bg-light-2) 100%);
}

[data-theme="dark"] {
  --bg-main: var(--bg-dark-1);
  --bg-content: var(--bg-dark-2);
  --bg-header: var(--bg-dark-2);
  --text-main: var(--text-dark-1);
  --text-secondary: var(--text-dark-2);
  --text-muted: var(--text-dark-3);
  --border-color: var(--border-dark);
  --shadow-color-light: rgba(255, 255, 255, 0.05);
  --shadow-color: rgba(0, 0, 0, 0.5);
  --gradient-bg: linear-gradient(180deg, var(--bg-dark-2) 0%, var(--bg-dark-1) 100%);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-main);
  color: var(--text-main);
  transition: background-color var(--transition-speed), color var(--transition-speed);
  line-height: 1.6;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  width: 95%;
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 2rem;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color-light);
  padding: 0 2.5%;
  transition: background-color var(--transition-speed), border-color var(--transition-speed);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
}

.logo span {
  color: var(--color-primary);
}

.nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  position: relative;
  padding: 4px;
}

.nav-button {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-family);
  color: var(--text-secondary);
  font-weight: 500;
  transition: color var(--transition-fast);
  white-space: nowrap;
  position: relative;
  z-index: 2;
}

.nav-button:hover {
  color: var(--text-main);
}

.nav-button.active {
  color: white;
}

.nav-indicator {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  background-color: var(--color-primary);
  border-radius: 6px;
  transition: left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: background-color var(--transition-speed), color var(--transition-speed);
}
.theme-toggle:hover {
    background-color: var(--bg-main);
}

.main-workspace {
  background: var(--gradient-bg);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px var(--shadow-color-light);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
}

.section-description {
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.input, .select, .textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
}

.input:focus, .select:focus, .textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

.textarea {
    min-height: 120px;
    resize: vertical;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.btn-secondary:hover {
    background-color: var(--bg-light-3);
    border-color: var(--border-color);
}

[data-theme="dark"] .btn-secondary {
    background-color: var(--bg-dark-3);
    color: var(--text-dark-1);
}
[data-theme="dark"] .btn-secondary:hover {
    background-color: var(--bg-dark-1);
    border-color: var(--text-dark-2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: none;
}

.loader {
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.output-container {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: var(--bg-main);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.output-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.idea-card {
    background: var(--bg-content);
    padding: 1rem 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.idea-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px var(--shadow-color-light);
    border-color: var(--color-primary);
}

.thumbnail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.thumbnail-item img {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: transform var(--transition-fast);
}
.thumbnail-item:hover img {
    transform: scale(1.03);
}

.range-slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.range-slider-container input[type="range"] {
    flex-grow: 1;
}
.range-slider-container span {
    font-weight: 500;
    color: var(--color-primary);
    min-width: 50px;
    text-align: center;
}

.notification-container {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.notification {
    background-color: var(--bg-content);
    color: var(--text-main);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-color);
    border-left: 4px solid var(--color-secondary);
    animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(-100%); }
    to { opacity: 1; transform: translateX(0); }
}

.scene-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.scene-card {
    background-color: var(--bg-content);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 4px var(--shadow-color-light);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.scene-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px var(--shadow-color);
}

.scene-card p {
    margin-bottom: 1rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    flex-grow: 1;
}

.scene-media-container {
    width: 100%;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
    position: relative;
    background-color: var(--bg-main);
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.scene-media-container img,
.scene-media-container video,
.scene-media-container .loader,
.scene-media-container span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.scene-media-container .loader {
    width: 1.5rem;
    height: 1.5rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.scene-media-container span {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
}
.segmented-control {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-main);
}
.segmented-control button {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    background-color: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}
.segmented-control button.active {
    background-color: var(--color-primary);
    color: white;
}
.voice-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    background-color: var(--bg-main);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid var(--border-color);
}
.progress-bar-container {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 8px;
}
.progress-bar {
    width: 100%;
    background-color: var(--bg-light-3);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border-color);
}
.progress-bar-inner {
    height: 12px;
    background-color: var(--color-secondary);
    transition: width 0.3s;
    border-radius: 4px;
}
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    return null;
};

// --- API CLIENT ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PEXELS_API_KEY = "LnXIN2uXgRfnwJhQC88FuS1zXr8Vbd3TX4fNXqzrFmu2iQrQE5kVAQtM";

// --- UTILITIES ---
const getApiErrorMessage = (error: any): string => {
    const errorString = error.toString();
    if (errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED")) {
        return "لقد تجاوزت الحصة المخصصة لواجهة برمجة التطبيقات. يرجى التحقق من خطتك والمحاولة مرة أخرى لاحقًا.";
    }
    if (errorString.includes("deadline") || errorString.includes("DEADLINE_EXCEEDED")) {
        return "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "حدث خطأ غير متوقع أثناء الاتصال بالخادم.";
};


// --- TYPES ---
type Scene = {
  description: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    poster?: string;
  };
  status: 'pending' | 'success' | 'error';
};
type ProjectData = {
  idea?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  script?: string;
  thumbnails?: string[];
  scenes?: Scene[];
};
type Notification = { id: number; message: string };

const SECTIONS = [
    { id: 1, name: "الأفكار" },
    { id: 2, name: "العناوين" },
    { id: 3, name: "الصور المصغرة" },
    { id: 4, name: "النص" },
    { id: 5, name: "المشاهد" },
];


// --- COMPONENTS ---

const Header = ({ activeSection, setActiveSection, theme, setTheme }) => {
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    // FIX: Changed ref type from HTMLDivElement to HTMLElement as it's attached to a <nav> element.
    const navRef = useRef<HTMLElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({});

    useEffect(() => {
        if (navRef.current) {
            const activeButton = navRef.current.querySelector<HTMLButtonElement>(`.nav-button[data-section-id="${activeSection}"]`);
            if (activeButton) {
                setIndicatorStyle({
                    left: `${activeButton.offsetLeft}px`,
                    width: `${activeButton.offsetWidth}px`,
                });
            }
        }
    }, [activeSection]);

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo"><span>مساعد</span> المبدعين</div>
                <nav className="nav" ref={navRef}>
                    {SECTIONS.map(section => (
                        <button 
                            key={section.id} 
                            onClick={() => setActiveSection(section.id)}
                            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
                            aria-current={activeSection === section.id ? 'page' : undefined}
                            data-section-id={section.id}
                        >
                            {section.name}
                        </button>
                    ))}
                    <div className="nav-indicator" style={indicatorStyle}></div>
                </nav>
                <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </header>
    );
};

const Loader = () => <div className="loader"></div>;

const GoldenIdeaGenerator = ({ setProjectData, navigateTo, addNotification }) => {
    const [theme, setTheme] = useState('');
    const [age, setAge] = useState(25);
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const generateIdeas = useCallback(async () => {
        if (!theme) {
            addNotification("يرجى إدخال موضوع القناة أولاً.");
            return;
        }
        setLoading(true);
        setIdeas([]);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `بصفتك خبيرًا في YouTube، قم بتوليد 4 أفكار فيديو مبتكرة وشائعة لقناة يوتيوب موضوعها "${theme}" وتستهدف جمهورًا بعمر ${age} عامًا. يجب أن تكون الأفكار جذابة ولها احتمالية عالية للانتشار.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            ideas: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text);
            setIdeas(result.ideas);
            addNotification("تم إنشاء الأفكار بنجاح!");
        } catch (error) {
            console.error("Error generating ideas:", error);
            const errorMessage = getApiErrorMessage(error);
            addNotification(errorMessage);
            if (errorMessage.includes("الحصة المخصصة")) {
                setCooldown(30);
                const interval = setInterval(() => {
                    setCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    }, [theme, age, addNotification]);

    const selectIdea = (idea) => {
        setProjectData(prev => ({ ...prev, idea }));
        addNotification(`تم اختيار الفكرة: "${idea.substring(0,30)}..."`);
        navigateTo(2);
    };

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">1. مولد الأفكار الذهبية</h2>
                <p className="section-description">أدخل تفاصيل قناتك ودع الذكاء الاصطناعي يقترح عليك أفكارًا رائجة ومبتكرة.</p>
            </div>
            <div className="form-group">
                <label htmlFor="channel-theme">موضوع القناة العام</label>
                {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                {/* FIX: Explicitly type event object to ensure type safety. */}
                <input id="channel-theme" type="text" className="input" value={theme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTheme(e.currentTarget.value)} placeholder="مثال: طبخ، ألعاب، تكنولوجيا، تطوير ذات..." />
            </div>
            <div className="form-group">
                <label htmlFor="audience-age">الفئة العمرية للجمهور ({age} سنة)</label>
                <div className="range-slider-container">
                    {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <input id="audience-age" type="range" min="13" max="65" value={age} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(Number(e.currentTarget.value))} />
                    <span>{age}</span>
                </div>
            </div>
            <button onClick={generateIdeas} className="btn btn-primary" disabled={loading || cooldown > 0}>
                {loading ? <Loader /> : '✨'}
                {cooldown > 0 ? `يرجى الانتظار (${cooldown} ثانية)` : (ideas.length > 0 ? 'اقترح أفكارًا جديدة' : 'ابحث عن أفكار')}
            </button>
            {ideas.length > 0 && (
                <div className="output-container">
                    <h3 className="output-title">اختر فكرة للبدء بها</h3>
                    {ideas.map((idea, index) => (
                        <div key={index} className="idea-card" onClick={() => selectIdea(idea)} role="button" tabIndex={0}>
                            {idea}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TitlesDescriptionsKeywords = ({ projectData, setProjectData, addNotification }) => {
    const [tone, setTone] = useState('احترافي');
    const [generated, setGenerated] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { idea } = projectData;

    const generateContent = useCallback(async () => {
        if (!idea) {
            addNotification("الرجاء اختيار فكرة أولاً من القسم السابق.");
            return;
        }
        setLoading(true);
        setGenerated(null);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `لفيديو يوتيوب عن "${idea}"، قم بإنشاء ما يلي بأسلوب ${tone}:
1. ثلاثة عناوين جذابة ومحسّنة للسيو (SEO).
2. وصف فيديو غني بالكلمات المفتاحية (حوالي 150 كلمة).
3. قائمة من 10 كلمات مفتاحية (keywords) مهمة.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            titles: { type: Type.ARRAY, items: {type: Type.STRING} },
                            description: { type: Type.STRING },
                            keywords: { type: Type.ARRAY, items: {type: Type.STRING} }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text);
            setGenerated(result);
            setProjectData(prev => ({...prev, title: result.titles[0], description: result.description, keywords: result.keywords }));
            addNotification("تم إنشاء العناوين والوصف بنجاح!");
        } catch (error) {
            console.error("Error generating content:", error);
            addNotification(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [idea, tone, addNotification, setProjectData]);

    if (!idea) {
        return <p>الرجاء العودة واختيار فكرة من "مولد الأفكار الذهبية".</p>;
    }

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">2. العناوين، الأوصاف، والكلمات المفتاحية</h2>
                <p className="section-description">أنشئ عناوين جذابة وأوصاف محسّنة لمحركات البحث لزيادة مشاهداتك.</p>
            </div>
            <p className="form-group"><strong>الفكرة المحددة:</strong> {idea}</p>
            <div className="form-group">
                <label htmlFor="tone-style">نبرة وأسلوب المحتوى</label>
                {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                {/* FIX: Explicitly type event object to ensure type safety. */}
                <select id="tone-style" className="select" value={tone} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.currentTarget.value)}>
                    <option>احترافي</option>
                    <option>ودي</option>
                    <option>فُكاهي</option>
                    <option>تعليمي</option>
                </select>
            </div>
            <button onClick={generateContent} className="btn btn-primary" disabled={loading}>
                {loading ? <Loader /> : '📝'}
                أنشئ العناوين والوصف
            </button>
            {generated && (
                <div className="output-container">
                    <div className="form-group">
                        <h3 className="output-title">اختر عنوانًا أساسيًا</h3>
                        {generated.titles.map((title, index) => (
                             <div key={index} style={{marginBottom: '0.5rem'}}>
                                <input type="radio" id={`title-${index}`} name="title" value={title} defaultChecked={index === 0} onChange={() => setProjectData(p => ({...p, title}))}/>
                                <label htmlFor={`title-${index}`} style={{marginRight: '8px', cursor: 'pointer'}}>{title}</label>
                            </div>
                        ))}
                    </div>
                    <div className="form-group">
                        <h3 className="output-title">الوصف المقترح (يمكنك تعديله)</h3>
                        {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                        {/* FIX: Explicitly type event object to ensure type safety. */}
                        <textarea className="textarea" rows="6" defaultValue={generated.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectData(p => ({...p, description: e.currentTarget.value}))}></textarea>
                    </div>
                     <div className="form-group">
                        <h3 className="output-title">الكلمات المفتاحية المقترحة</h3>
                        <p>{generated.keywords.join(', ')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const ThumbnailCreator = ({ projectData, setProjectData, addNotification }) => {
    const [style, setStyle] = useState('');
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const { title } = projectData;

    const generateThumbnails = useCallback(async () => {
        if (!title) {
            addNotification("لا يوجد عنوان لإنشاء صورة مصغرة له.");
            return;
        }
        if (!style) {
            addNotification("الرجاء إدخال وصف لنمط الصورة.");
            return;
        }
        setLoading(true);
        setThumbnails([]);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `YouTube thumbnail for a video titled "${title}". Style: ${style}. Vibrant, eye-catching, high contrast, text-free.`,
                config: {
                    numberOfImages: 3,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });
            const imageBase64s = response.generatedImages.map(img => img.image.imageBytes);
            setThumbnails(imageBase64s);
            setProjectData(p => ({...p, thumbnails: imageBase64s}));
            addNotification("تم إنشاء الصور المصغرة بنجاح!");
        } catch (error) {
            console.error("Error generating thumbnails:", error);
            addNotification(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [title, style, addNotification, setProjectData]);

    if (!title) {
        return <p>الرجاء إنشاء عنوان في القسم السابق أولاً.</p>;
    }
    
    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">3. مُنشئ الصور المصغرة</h2>
                <p className="section-description">صف النمط المرئي الذي تريده، وسيقوم الذكاء الاصطناعي بتصميم صور مصغرة فريدة وجذابة.</p>
            </div>
            <p className="form-group"><strong>العنوان:</strong> {title}</p>
            <div className="form-group">
                <label htmlFor="style-desc">وصف النمط المرئي</label>
                {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                {/* FIX: Explicitly type event object to ensure type safety. */}
                <input id="style-desc" type="text" className="input" value={style} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStyle(e.currentTarget.value)} placeholder="مثال: فن رقمي ملون، واقعي، رسوم متحركة، بسيط..." />
            </div>
            <button onClick={generateThumbnails} className="btn btn-primary" disabled={loading}>
                {loading ? <Loader /> : '🖼️'}
                صمم 3 صور مصغرة
            </button>
            {thumbnails.length > 0 && (
                <div className="output-container">
                    <h3 className="output-title">اختر وحمل الصورة المفضلة</h3>
                    <div className="thumbnail-grid">
                        {thumbnails.map((base64, index) => (
                            <div key={index} className="thumbnail-item">
                                <img src={`data:image/jpeg;base64,${base64}`} alt={`Thumbnail ${index + 1}`} />
                                <a href={`data:image/jpeg;base64,${base64}`} download={`thumbnail_${index + 1}.jpg`} className="btn btn-secondary">
                                    تحميل الصورة
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ScriptGenerator = ({ projectData, setProjectData, addNotification }) => {
    const [length, setLength] = useState(5);
    const [tone, setTone] = useState('سردي');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { idea, title } = projectData;

    const generateScript = useCallback(async () => {
        if (!idea || !title) {
            addNotification("الرجاء تحديد فكرة وعنوان أولاً.");
            return;
        }
        setLoading(true);
        setScript('');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `اكتب نصًا (سيناريو) كاملاً لفيديو يوتيوب مدته حوالي ${length} دقائق.
الفكرة: "${idea}"
العنوان: "${title}"
الأسلوب: ${tone}
يجب أن يتضمن النص مقدمة جذابة، محتوى رئيسي مقسم، وخاتمة تحث على التفاعل (مثل الإعجاب والاشتراك).`,
            });
            const textResponse = response.text;
            setScript(textResponse);
            setProjectData(p => ({...p, script: textResponse}));
            addNotification("تم إنشاء النص بنجاح!");
        } catch (error) {
            console.error("Error generating script:", error);
            addNotification(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [idea, title, length, tone, addNotification, setProjectData]);

    const downloadScript = () => {
        // FIX: Add a check for document to avoid errors in non-browser environments.
        if (typeof document === 'undefined') return;
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'script.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    useEffect(() => {
      if (projectData.script) {
          setScript(projectData.script);
      }
    }, [projectData.script]);

    if (!idea) return <p>الرجاء إكمال الأقسام السابقة أولاً.</p>;
    
    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">4. مولد النصوص (السيناريو)</h2>
                <p className="section-description">أنشئ سيناريو كاملاً ومنظمًا لفيديوك ببضع نقرات.</p>
            </div>
            <div className="form-group">
                <label htmlFor="video-length">المدة الزمنية للفيديو (بالدقائق)</label>
                {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'valueAsNumber'. */}
                {/* FIX: Explicitly type event object to ensure type safety. */}
                <input id="video-length" type="number" className="input" value={length} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLength(e.currentTarget.valueAsNumber || 0)} />
            </div>
            <div className="form-group">
                <label htmlFor="script-tone">نبرة وأسلوب النص</label>
                {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                {/* FIX: Explicitly type event object to ensure type safety. */}
                <select id="script-tone" className="select" value={tone} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.currentTarget.value)}>
                    <option>سردي</option>
                    <option>حماسي</option>
                    <option>إعلامي</option>
                    <option>تعليمي</option>
                </select>
            </div>
            <button onClick={generateScript} className="btn btn-primary" disabled={loading}>
                {loading ? <Loader /> : '📜'}
                اكتب النص الآن
            </button>
            {script && (
                <div className="output-container">
                    <h3 className="output-title">النص المكتمل (يمكنك تعديله)</h3>
                    {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <textarea className="textarea" rows="15" value={script} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScript(e.currentTarget.value)}></textarea>
                    <button onClick={downloadScript} className="btn btn-secondary" style={{marginTop: '1rem'}}>
                        تحميل النص (.txt)
                    </button>
                </div>
            )}
        </div>
    );
};

const SceneBuilder = ({ projectData, setProjectData, addNotification }) => {
    const { script } = projectData;
    const [numberOfScenes, setNumberOfScenes] = useState(5);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [frameRate, setFrameRate] = useState(25);
    const [videoQuality, setVideoQuality] = useState(23); // CRF value: 18 (high), 23 (medium), 28 (low)
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [visualStyle, setVisualStyle] = useState('ai'); // 'ai' or 'pexels'
    const [aiImageStyle, setAiImageStyle] = useState('cinematic shot, high detail');
    const [isRendering, setIsRendering] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderMessage, setRenderMessage] = useState('');
    const [renderErrorLog, setRenderErrorLog] = useState<string | null>(null);

    const ffmpegRef = useRef(new FFmpeg());

    const generateScenes = useCallback(async () => {
        if (!script) {
            addNotification("يرجى إنشاء نص في القسم السابق أولاً.");
            return;
        }
        setLoading(true);
        setScenes([]);
        setGenerationProgress(0);
        addNotification("بدء تحليل النص وتقسيمه إلى مشاهد...");

        try {
            const sceneResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `حلل نص الفيديو التالي وقسمه إلى ${numberOfScenes} مشهدًا مرئيًا. لكل مشهد، قدم وصفًا موجزًا ومناسبًا لمولد صور الذكاء الاصطناعي أو للبحث عن فيديو. يجب أن يلتقط الوصف العنصر المرئي الرئيسي لذلك الجزء من النص.
النص: """${script}"""`,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { scenes: { type: Type.ARRAY, items: { type: Type.STRING, description: "A descriptive prompt for AI image/video search." } } } } }
            });
            const sceneResult = JSON.parse(sceneResponse.text);
            const sceneDescriptions = sceneResult.scenes;

            if (!sceneDescriptions || sceneDescriptions.length === 0) throw new Error("لم يتمكن الذكاء الاصطناعي من تقسيم النص إلى مشاهد.");
            
            addNotification(`تم تقسيم النص إلى ${sceneDescriptions.length} مشهدًا. بدء إنشاء المرئيات...`);
            
            const initialScenes: Scene[] = sceneDescriptions.map(desc => ({ description: desc, status: 'pending' }));
            setScenes(initialScenes);

            let generatedScenes = [...initialScenes];

            for (let i = 0; i < sceneDescriptions.length; i++) {
                const description = sceneDescriptions[i];
                try {
                    if (visualStyle === 'ai') {
                        const imageResponse = await ai.models.generateImages({
                            model: 'imagen-4.0-generate-001',
                            prompt: `${aiImageStyle}, ${description}`,
                            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio as "16:9" | "9:16" },
                        });
                        const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;
                        generatedScenes[i].media = { type: 'image', url: `data:image/jpeg;base64,${imageBase64}` };
                    } else { // Pexels
                        const keywordsResponse = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `From the following scene description, extract 2-3 main keywords for a stock video search. Return only comma-separated keywords. Description: "${description}"`,
                        });
                        const keywordsText = keywordsResponse.text;
                        const keywords = keywordsText ? keywordsText.trim() : description;
                        const pexelsResponse = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=${aspectRatio === '9:16' ? 'portrait' : 'landscape'}`, {
                            headers: { Authorization: PEXELS_API_KEY }
                        });
                        if(!pexelsResponse.ok) throw new Error(`Pexels API error: ${pexelsResponse.statusText}`);
                        const pexelsData = await pexelsResponse.json();
                        if (pexelsData.videos.length > 0) {
                            const video = pexelsData.videos[0];
                            const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
                            generatedScenes[i].media = { type: 'video', url: videoFile.link, poster: video.image };
                        } else {
                           addNotification(`لم يتم العثور على فيديو للمشهد ${i + 1}، سيتم إنشاء صورة بدلاً من ذلك.`);
                           const imageResponse = await ai.models.generateImages({
                                model: 'imagen-4.0-generate-001',
                                prompt: `${aiImageStyle}, ${description}`,
                                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio as "16:9" | "9:16" },
                           });
                           const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;
                           generatedScenes[i].media = { type: 'image', url: `data:image/jpeg;base64,${imageBase64}` };
                        }
                    }
                    generatedScenes[i].status = 'success';
                } catch (mediaError) {
                    console.error(`Error generating media for scene ${i + 1}:`, mediaError);
                    const sceneErrorMessage = getApiErrorMessage(mediaError);
                    generatedScenes[i].status = 'error';
                    setScenes([...generatedScenes]);

                    if (sceneErrorMessage.includes("الحصة المخصصة")) {
                        addNotification(sceneErrorMessage);
                        addNotification("تم إيقاف إنشاء المشاهد المتبقية.");
                        for (let j = i + 1; j < generatedScenes.length; j++) {
                            generatedScenes[j].status = 'error';
                        }
                        setScenes([...generatedScenes]);
                        i = sceneDescriptions.length; // Break the loop
                    } else {
                        addNotification(`فشل إنشاء مرئيات للمشهد ${i + 1}.`);
                    }
                }
                setScenes([...generatedScenes]);
                setGenerationProgress(((i + 1) / sceneDescriptions.length) * 100);
            }
            
            setProjectData(prev => ({...prev, scenes: generatedScenes}));
            addNotification("اكتمل إنشاء جميع المرئيات للمشاهد!");

        } catch (error) {
            console.error("Error in scene builder:", error);
            addNotification(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [script, numberOfScenes, aspectRatio, addNotification, setProjectData, visualStyle, aiImageStyle]);
    
    const combineAndDownload = async () => {
        const successfulScenes = scenes.filter(s => s.status === 'success' && s.media);
        if (successfulScenes.length === 0) {
            addNotification("لا توجد مشاهد ناجحة لدمجها.");
            return;
        }

        setIsRendering(true);
        setRenderErrorLog(null);
        setRenderProgress(0);
        setRenderMessage('بدء التحميل... قد تستغرق هذه العملية بعض الوقت.');

        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        ffmpeg.on('progress', ({ progress, time }) => {
             setRenderProgress(progress * 100);
             const timeInSeconds = time / 1000000;
             setRenderMessage(`جاري المعالجة... (${Math.round(progress * 100)}%) - ${timeInSeconds.toFixed(1)}s`);
        });

        try {
            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
            });

            setRenderMessage('تحميل الملفات المصدرية...');
            for (let i = 0; i < successfulScenes.length; i++) {
                const scene = successfulScenes[i];
                const fileName = `scene_${i}.${scene.media.type === 'image' ? 'jpeg' : 'mp4'}`;
                const data = await fetchFile(scene.media.url);
                await ffmpeg.writeFile(fileName, data);
            }

            setRenderMessage('جاري دمج المشاهد في فيديو واحد...');
            if (visualStyle === 'ai' || successfulScenes.every(s => s.media.type === 'image')) { // Images to video
                 await ffmpeg.exec([
                    '-framerate', '1/3', // Each image is an input frame that lasts 3 seconds
                    '-i', 'scene_%d.jpeg',
                    '-c:v', 'libx264',
                    '-r', frameRate.toString(), // User-defined output frame rate
                    '-crf', videoQuality.toString(), // User-defined quality
                    '-pix_fmt', 'yuv420p',
                    'output.mp4'
                ]);
            } else { // Pexels videos (or mixed content) to one video
                const fileList = successfulScenes.map((s, i) => `file 'scene_${i}.${s.media.type === 'image' ? 'jpeg' : 'mp4'}'`).join('\n');
                await ffmpeg.writeFile('mylist.txt', fileList);
                
                const targetResolution = aspectRatio === '16:9' ? '1280:720' : '720:1280';
                
                const inputs = successfulScenes.map((_, i) => ['-i', `scene_${i}.${successfulScenes[i].media.type === 'image' ? 'jpeg' : 'mp4'}`]).flat();
                const filterComplexParts = [];
                let outputStreams = '';
                const imageDurationInFrames = 3 * frameRate;

                for(let i=0; i<successfulScenes.length; i++) {
                    const scene = successfulScenes[i];
                    if (scene.media.type === 'image') {
                        // Create a 3-second clip from the image at the target framerate
                        filterComplexParts.push(`[${i}:v]scale=${targetResolution}:force_original_aspect_ratio=decrease,pad=${targetResolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,loop=loop=${imageDurationInFrames}:size=1:start=0[v${i}]`);
                    } else {
                        // Scale and pad video to fit target resolution
                        filterComplexParts.push(`[${i}:v]scale=${targetResolution}:force_original_aspect_ratio=decrease,pad=${targetResolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[v${i}]`);
                    }
                    outputStreams += `[v${i}]`;
                }
                
                filterComplexParts.push(`${outputStreams}concat=n=${successfulScenes.length}:v=1:a=0[out]`);

                await ffmpeg.exec([
                    ...inputs,
                    '-filter_complex', filterComplexParts.join(';'),
                    '-map', '[out]',
                    '-c:v', 'libx264',
                    '-r', frameRate.toString(),
                    '-crf', videoQuality.toString(),
                    'output.mp4'
                ]);
            }

            setRenderMessage('اكتملت المعالجة! جاري تجهيز التحميل...');
            const data = await ffmpeg.readFile('output.mp4');
            // FIX: Add a check for document to avoid errors in non-browser environments.
            if (typeof document !== 'undefined') {
                const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'final_video.mp4';
                a.click();
                URL.revokeObjectURL(url);
                addNotification("تم تحميل الفيديو المدمج بنجاح!");
            }
            
        } catch (error) {
            console.error("Error rendering video:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setRenderErrorLog(errorMessage);
            addNotification(`فشل دمج الفيديو: ${errorMessage}`);
        } finally {
            setIsRendering(false);
            setRenderProgress(0);
        }
    };


    if (!script) return <p>يرجى إنشاء نص في القسم السابق أولاً.</p>;

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">5. منشئ المشاهد</h2>
                <p className="section-description">حوّل النص إلى مشاهد مرئية، ثم قم بدمجها في فيديو واحد جاهز للتحميل.</p>
            </div>

            <div className="form-group">
                <label>نوع المرئيات للمشاهد</label>
                <div className="segmented-control">
                    <button className={visualStyle === 'ai' ? 'active' : ''} onClick={() => setVisualStyle('ai')}>صور بالذكاء الاصطناعي</button>
                    <button className={visualStyle === 'pexels' ? 'active' : ''} onClick={() => setVisualStyle('pexels')}>فيديوهات حقيقية (Pexels)</button>
                </div>
            </div>

            {visualStyle === 'ai' && (
                 <div className="form-group">
                    <label htmlFor="ai-style">أسلوب تصميم صور المشاهد</label>
                    {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <input id="ai-style" type="text" className="input" value={aiImageStyle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiImageStyle(e.currentTarget.value)} placeholder="مثال: cinematic, anime, photorealistic..." />
                </div>
            )}

            <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                <div className="form-group" style={{flex: 1}}>
                    <label htmlFor="num-scenes">عدد المشاهد المطلوبة</label>
                    {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'valueAsNumber'. */}
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <input id="num-scenes" type="number" className="input" value={numberOfScenes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumberOfScenes(e.currentTarget.valueAsNumber || 1)} min="1" max="10" />
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label htmlFor="aspect-ratio">نسبة أبعاد الفيديو</label>
                    {/* FIX: Use e.currentTarget instead of e.target for type-safe access to element properties like 'value'. */}
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <select id="aspect-ratio" className="select" value={aspectRatio} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAspectRatio(e.currentTarget.value)}>
                        <option value="16:9">16:9 (أفقي)</option>
                        <option value="9:16">9:16 (عمودي)</option>
                    </select>
                </div>
            </div>
            <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                <div className="form-group" style={{flex: 1}}>
                    <label htmlFor="frame-rate">معدل الإطارات (FPS)</label>
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <select id="frame-rate" className="select" value={frameRate} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFrameRate(Number(e.currentTarget.value))}>
                        <option value="24">24</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="60">60</option>
                    </select>
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label htmlFor="video-quality">جودة الفيديو</label>
                    {/* FIX: Explicitly type event object to ensure type safety. */}
                    <select id="video-quality" className="select" value={videoQuality} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVideoQuality(Number(e.currentTarget.value))}>
                        <option value="18">عالية (ملف أكبر)</option>
                        <option value="23">متوسطة (موصى به)</option>
                        <option value="28">منخفضة (ملف أصغر)</option>
                    </select>
                </div>
            </div>
            
            <button onClick={generateScenes} className="btn btn-primary" disabled={loading || isRendering}>
                {loading ? <Loader /> : '🎬'}
                أنشئ المشاهد الآن
            </button>

            {loading && (
                <div style={{marginTop: '1.5rem'}}>
                    <p>جاري إنشاء المشاهد... ({Math.round(generationProgress)}%)</p>
                    <div className="progress-bar">
                        <div className="progress-bar-inner" style={{width: `${generationProgress}%`}}></div>
                    </div>
                </div>
            )}

            {scenes.length > 0 && !loading && (
                 <div className="output-container">
                    <h3 className="output-title">المشاهد المولدة</h3>
                    <div className="scene-grid">
                        {scenes.map((scene, index) => (
                            <div key={index} className="scene-card">
                                <p><strong>مشهد {index + 1}:</strong> {scene.description}</p>
                                <div className="scene-media-container">
                                    {scene.status === 'error' ? (
                                        <span style={{color: 'var(--color-danger)'}}>فشل التحميل</span>
                                    ) : scene.status === 'success' && scene.media ? (
                                        scene.media.type === 'image' ? (
                                            <img src={scene.media.url} alt={`Scene ${index + 1}`} />
                                        ) : (
                                            <video key={scene.media.url} controls muted loop poster={scene.media.poster}>
                                                <source src={scene.media.url} type="video/mp4" />
                                                متصفحك لا يدعم عرض الفيديو.
                                            </video>
                                        )
                                    ) : (
                                        <Loader />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {!isRendering ? (
                        <button onClick={combineAndDownload} className="btn btn-primary" style={{marginTop: '2rem', backgroundColor: 'var(--color-secondary)'}}>
                           🎥 دمج وتحميل الفيديو
                        </button>
                    ) : (
                        <div className="progress-bar-container">
                            <p style={{marginBottom: '0.5rem', fontWeight: '500'}}>{renderMessage}</p>
                            <div className="progress-bar">
                                <div className="progress-bar-inner" style={{width: `${renderProgress}%`}}></div>
                            </div>
                        </div>
                    )}
                    {renderErrorLog && !isRendering && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--color-danger)', borderRadius: '8px' }}>
                            <strong style={{ color: 'var(--color-danger)' }}>حدث خطأ أثناء المعالجة:</strong>
                            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', direction: 'ltr', textAlign: 'left' }}>{renderErrorLog}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const App = () => {
    const [theme, setTheme] = useState('light');
    const [activeSection, setActiveSection] = useState(1);
    const [projectData, setProjectData] = useState<ProjectData>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // FIX: Add a check for document to avoid errors in non-browser environments.
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);
    
    const addNotification = useCallback((message: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const navigateTo = (sectionId: number) => {
        setActiveSection(sectionId);
    };
    
    const sectionComponents = useMemo(() => ({
        1: <GoldenIdeaGenerator setProjectData={setProjectData} navigateTo={navigateTo} addNotification={addNotification} />,
        2: <TitlesDescriptionsKeywords projectData={projectData} setProjectData={setProjectData} addNotification={addNotification} />,
        3: <ThumbnailCreator projectData={projectData} setProjectData={setProjectData} addNotification={addNotification} />,
        4: <ScriptGenerator projectData={projectData} setProjectData={setProjectData} addNotification={addNotification} />,
        5: <SceneBuilder projectData={projectData} setProjectData={setProjectData} addNotification={addNotification} />,
    }), [projectData, addNotification]);

    return (
        <>
            <GlobalStyles />
            <Header activeSection={activeSection} setActiveSection={setActiveSection} theme={theme} setTheme={setTheme} />
            <main className="app-container">
                <div className="main-workspace">
                    {sectionComponents[activeSection]}
                </div>
            </main>
            <div className="notification-container">
                {notifications.map(n => (
                    <div key={n.id} className="notification">
                        {n.message}
                    </div>
                ))}
            </div>
        </>
    );
};

// --- RENDER ---
// FIX: Add a check for document to avoid errors in non-browser environments and ensure root element exists.
if (typeof document !== 'undefined') {
    const rootEl = document.getElementById('root');
    if (rootEl) {
        const root = createRoot(rootEl);
        root.render(<App />);
    }
}