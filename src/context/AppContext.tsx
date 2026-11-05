import React, { createContext, useContext, useEffect, useState } from 'react';
import { BirthInput, NatalChart } from '../domain/types';
import { generateNatalChart } from '../domain/tuViEngine';
import { getYearCanChi, solarToLunar } from '../domain/lunarCalendar';
import { calculateAnnualLimitState, getAnnualAgeAtBranch } from '../domain/annualLimits';
import { AISettings, ChatMessage } from '../ai/types';
import { ThienCoCopilot } from '../ai/copilot';

export type AppRoute =
  | '/'
  | '/dang-nhap'
  | '/dang-ky'
  | '/la-so'
  | '/menh-ban'
  | '/thien-co'
  | '/tu-hoa'
  | '/kinh-dich'
  | '/van-han'
  | '/thu-cac'
  | '/ho-so'
  | '/cai-dat';

export interface PersonalNote {
  id: string;
  chartId?: string;
  title: string;
  content: string;
  createdAt: string;
}

// Auth integration contract: the login flow supplies this profile after successful sign-in.
// Birth date must be YYYY-MM-DD and birth time HH:mm in the user's local birth timezone.
export interface AuthenticatedUserProfile {
  id: string;
  name: string;
  birthDate?: string;
  birthTime?: string;
  gender?: 'Nam' | 'Nữ';
  calendar?: 'solar' | 'lunar';
  isLeapMonth?: boolean;
}

interface AppContextType {
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
  activeChart: NatalChart;
  savedCharts: NatalChart[];
  authenticatedUser: AuthenticatedUserProfile | null;
  setAuthenticatedUser: (user: AuthenticatedUserProfile | null) => void;
  createChart: (input: BirthInput) => NatalChart;
  updateForecastYear: (year: number) => void;
  selectChart: (chart: NatalChart) => void;
  deleteChart: (id: string) => void;
  focusedPalaceIndex: number | null;
  setFocusedPalaceIndex: (index: number | null) => void;
  chatMessages: ChatMessage[];
  isChatStreaming: boolean;
  streamingMessageContent: string;
  sendMessageToThienCo: (prompt: string) => Promise<void>;
  clearChatHistory: () => void;
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
  personalNotes: PersonalNote[];
  addPersonalNote: (title: string, content: string) => void;
  deletePersonalNote: (id: string) => void;
}

const EMPTY_INPUT: BirthInput = {
  name: '',
  date: '2000-01-01',
  time: '12:00',
  gender: 'Nam',
  calendar: 'solar',
  forecastYear: 2026,
  notes: '',
};

const DEFAULT_SETTINGS: AISettings = {
  provider: 'demo',
  apiKey: '',
  modelName: 'gemini-1.5-pro',
  temperature: 0.7,
  school: 'kham_thien',
};

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Kính chào quý đương số đến với **Hoài Nguyệt Các** (懷月閣).

Nơi đây cổ học Đông Phương tương phùng cùng trí tuệ nhân tạo. Tôi là **AI Thiên Cơ**, đồng hành cùng quý vị luận giải mệnh bàn, quan sát phi hóa Tứ Hóa và chiêm nghiệm biến dịch của Kinh Dịch.

*Quý vị có thể đặt câu hỏi bằng tiếng Việt tự nhiên:*
- *"Tại sao năm 2026 cung Tài Bạch của tôi có nhiều biến động?"*
- *"Phân tích khí cơ cung Phu Thê và duyên phối ngẫu?"*
- *"Gieo một quẻ Kinh Dịch để chiêm nghiệm công việc sắp tới?"*`,
  createdAt: new Date().toISOString(),
  suggestedQuestions: [
    'Phân tích cung Mệnh và Cung Thân của tôi',
    'Năm 2026 Bính Ngọ cung Tài Bạch của tôi thế nào?',
    'Khảo sát các đường Phi Hóa và Tự Hóa Khâm Thiên',
    'Gieo quẻ Lục Hào chiêm nghiệm thời vận',
  ],
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUserProfile | null>(null);
  // Đồng bộ route từ URL hoặc mặc định '/'
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const path = window.location.pathname;
    const validRoutes: AppRoute[] = [
      '/', '/dang-nhap', '/dang-ky', '/la-so', '/menh-ban', '/thien-co', '/tu-hoa', '/kinh-dich', '/van-han', '/thu-cac', '/ho-so', '/cai-dat',
    ];
    if (validRoutes.includes(path as AppRoute)) return path as AppRoute;
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '') as AppRoute;
      if (validRoutes.includes(hash)) return hash;
    }
    return '/';
  });

  // Dùng mệnh bàn rỗng làm dữ liệu nội bộ cho các màn hình cần chart trước lần lập đầu tiên.
  // Không lưu hoặc trình bày đây như lá số mẫu của một người dùng.
  const initialChart = generateNatalChart(EMPTY_INPUT);

  const [savedCharts, setSavedCharts] = useState<NatalChart[]>(() => {
    try {
      const saved = localStorage.getItem('hoai_nguyet_charts');
      if (saved) {
        const charts = JSON.parse(saved) as NatalChart[];
        return charts
          .filter((chart) => !(chart.name === 'Nguyễn Minh An' && chart.solarDate === '1992-08-18'))
          .map((chart) => {
            // Rebuild old saved charts so corrected palace/star rules take effect immediately.
            // Legacy records did not persist the selected calendar, so infer it by checking
            // whether solarDate reproduces the stored lunar date.
            const [year, month, day] = chart.solarDate.split('-').map(Number);
            const lunarFromStoredDate = solarToLunar(day, month, year);
            const storedLunar = chart.lunarDate;
            const storedDateIsSolar = lunarFromStoredDate.lYear === storedLunar.year
              && lunarFromStoredDate.lMonth === storedLunar.month
              && lunarFromStoredDate.lDay === storedLunar.day;
            return generateNatalChart({
              name: chart.name,
              date: chart.solarDate,
              time: chart.time,
              gender: chart.gender,
              calendar: storedDateIsSolar ? 'solar' : 'lunar',
              isLeapMonth: storedLunar.isLeap,
              forecastYear: chart.forecastYear,
              notes: chart.notes,
            });
          });
      }
    } catch (e) {
      console.warn('Lỗi đọc saved charts', e);
    }
    return [];
  });

  const [activeChart, setActiveChart] = useState<NatalChart>(() => {
    return savedCharts[0] || initialChart;
  });

  // Login providers should emit this event after authentication and on logout.
  useEffect(() => {
    const onAuthChange = (event: Event) => {
      const detail = (event as CustomEvent<AuthenticatedUserProfile | null>).detail;
      setAuthenticatedUser(detail?.id ? detail : null);
    };
    window.addEventListener('hoai-nguyet:auth-changed', onAuthChange);
    return () => window.removeEventListener('hoai-nguyet:auth-changed', onAuthChange);
  }, []);

  // A signed-in profile with complete birth data gets a chart calculated by the same engine as manual entry.
  useEffect(() => {
    if (!authenticatedUser?.birthDate || !authenticatedUser.birthTime || !authenticatedUser.gender) return;
    const profileChart = generateNatalChart({
      name: authenticatedUser.name,
      date: authenticatedUser.birthDate,
      time: authenticatedUser.birthTime,
      gender: authenticatedUser.gender,
      calendar: authenticatedUser.calendar ?? 'solar',
      isLeapMonth: authenticatedUser.isLeapMonth ?? false,
      forecastYear: new Date().getFullYear(),
    });
    setActiveChart(profileChart);
  }, [authenticatedUser]);

  const [focusedPalaceIndex, setFocusedPalaceIndex] = useState<number | null>(null);

  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('hoai_nguyet_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('hoai_nguyet_chat');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc chat history', e);
    }
    return [INITIAL_GREETING];
  });

  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const [streamingMessageContent, setStreamingMessageContent] = useState('');

  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => {
    try {
      const saved = localStorage.getItem('hoai_nguyet_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc notes', e);
    }
    return [
      {
        id: 'note-1',
        title: 'Tâm đắc về Hóa Kỵ Khâm Thiên',
        content: 'Hóa Kỵ không phải tai họa, mà là điểm quy tụ năng lượng của linh hồn. Nơi nào có Kỵ, nơi đó ta dành trọn tâm huyết đời này.',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Copilot singleton instance
  const [copilot] = useState(() => new ThienCoCopilot(activeChart, settings));

  useEffect(() => {
    copilot.updateChart(activeChart);
  }, [activeChart, copilot]);

  useEffect(() => {
    copilot.updateSettings(settings);
    localStorage.setItem('hoai_nguyet_settings', JSON.stringify(settings));
  }, [settings, copilot]);

  useEffect(() => {
    localStorage.setItem('hoai_nguyet_charts', JSON.stringify(savedCharts));
  }, [savedCharts]);

  useEffect(() => {
    localStorage.setItem('hoai_nguyet_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('hoai_nguyet_notes', JSON.stringify(personalNotes));
  }, [personalNotes]);

  // Lắng nghe popstate từ trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      setCurrentRoute(path || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createChart = (input: BirthInput): NatalChart => {
    const chart = generateNatalChart(input);
    const updated = [chart, ...savedCharts.filter((c) => c.name !== chart.name || c.solarDate !== chart.solarDate)];
    setSavedCharts(updated);
    setActiveChart(chart);
    return chart;
  };

  const updateForecastYear = (year: number) => {
    if (!Number.isInteger(year) || year < 1800 || year > 2199) {
      throw new RangeError('Năm xem phải nằm trong khoảng 1800–2199.');
    }
    setActiveChart((current) => {
      const annualState = calculateAnnualLimitState(current, year);
      const tieuHanIndex = annualState.tieuHan.branchIndex;
      const lunarMonthByBranch = new Map(annualState.monthlyLimits.map((limit) => [limit.branchIndex, limit.month]));
      const nextChart: NatalChart = {
        ...current,
        forecastYear: year,
        forecastCanChi: getYearCanChi(year),
        palaces: current.palaces.map((palace) => ({
          ...palace,
          annualAge: getAnnualAgeAtBranch(current.birthCanChi.year.branch, current.gender, palace.index),
          isAnnualLimit: palace.index === tieuHanIndex,
          lunarMonth: lunarMonthByBranch.get(palace.index) ?? palace.lunarMonth,
        })),
      };
      setSavedCharts((saved) => saved.map((chart) => chart.id === nextChart.id ? nextChart : chart));
      return nextChart;
    });
  };

  const selectChart = (chart: NatalChart) => {
    setActiveChart(chart);
  };

  const deleteChart = (id: string) => {
    const updated = savedCharts.filter((c) => c.id !== id);
    setSavedCharts(updated);
    if (activeChart.id === id && updated.length > 0) {
      setActiveChart(updated[0]);
    }
  };

  const sendMessageToThienCo = async (prompt: string) => {
    if (!prompt.trim() || isChatStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
      chartContextId: activeChart.id,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatStreaming(true);
    setStreamingMessageContent('');

    try {
      await copilot.streamResponse(
        prompt,
        chatMessages,
        activeChart,
        (chunk) => {
          setStreamingMessageContent(chunk);
        },
        (finalMessage) => {
          setChatMessages((prev) => [...prev, finalMessage]);
          setIsChatStreaming(false);
          setStreamingMessageContent('');
        }
      );
    } catch (err: any) {
      console.error('Lỗi khi đối thoại cùng Thiên Cơ:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Đã có gián đoạn khí tức khi đối thoại: ${err.message || 'Không thể phản hồi'}. Xin hãy thử lại.`,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      setIsChatStreaming(false);
      setStreamingMessageContent('');
    }
  };

  const clearChatHistory = () => {
    setChatMessages([INITIAL_GREETING]);
  };

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addPersonalNote = (title: string, content: string) => {
    const note: PersonalNote = {
      id: `note-${Date.now()}`,
      chartId: activeChart.id,
      title: title.trim() || 'Ghi chép tâm đắc',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setPersonalNotes((prev) => [note, ...prev]);
  };

  const deletePersonalNote = (id: string) => {
    setPersonalNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        activeChart,
        savedCharts,
        authenticatedUser,
        setAuthenticatedUser,
        createChart,
        updateForecastYear,
        selectChart,
        deleteChart,
        focusedPalaceIndex,
        setFocusedPalaceIndex,
        chatMessages,
        isChatStreaming,
        streamingMessageContent,
        sendMessageToThienCo,
        clearChatHistory,
        settings,
        updateSettings,
        personalNotes,
        addPersonalNote,
        deletePersonalNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp phải được sử dụng trong AppProvider');
  return context;
};
