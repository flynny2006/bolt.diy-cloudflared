/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { Messages } from './Messages.client';
import { getApiKeysFromCookies } from './APIKeyManager';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from './BaseChat.module.scss';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import GitCloneButton from './GitCloneButton';
import type { ProviderInfo } from '~/types/model';
import StarterTemplates from './StarterTemplates';
import type { ActionAlert, SupabaseAlert, DeployAlert } from '~/types/actions';
import DeployChatAlert from '~/components/deploy/DeployAlert';
import ChatAlert from './ChatAlert';
import type { ModelInfo } from '~/lib/modules/llm/types';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '~/types/context';
import type { ActionRunner } from '~/lib/runtime/action-runner';
import { SupabaseChatAlert } from '~/components/chat/SupabaseAlert';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { useStore } from '@nanostores/react';
import { StickToBottom, useStickToBottomContext } from '~/lib/hooks';
import { ChatBox } from './ChatBox';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import TokenUsageTracker from './TokenUsageTracker';
import { Dialog, DialogRoot } from '~/components/ui/Dialog';
import { SettingsButton } from '~/components/ui/SettingsButton';
import { useTranslation } from '~/components/ui/useTranslation';
import { Dropdown, DropdownItem } from '~/components/ui/Dropdown';

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string, isFixRequest?: boolean) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  supabaseAlert?: SupabaseAlert;
  clearSupabaseAlert?: () => void;
  deployAlert?: DeployAlert;
  clearDeployAlert?: () => void;
  data?: JSONValue[] | undefined;
  actionRunner?: ActionRunner;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  append?: (message: Message) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: (element: ElementInfo | null) => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      deployAlert,
      clearDeployAlert,
      supabaseAlert,
      clearSupabaseAlert,
      data,
      actionRunner,
      chatMode,
      setChatMode,
      append,
      designScheme,
      setDesignScheme,
      selectedElement,
      setSelectedElement,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [modelList, setModelList] = useState<ModelInfo[]>([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    const expoUrl = useStore(expoUrlAtom);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number }>({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    });
    const [countdown, setCountdown] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsCategory, setSettingsCategory] = useState(0);
    const { t, language, setLanguage, languages } = useTranslation();
    const settingsCategories = [
      'General',
      'Appearance',
      'Account',
      'Integrations',
      'Tokens',
      'About',
    ];
    const [showAIWarning, setShowAIWarning] = useState(true);

    // Countdown timer for unlimited tokens
    useEffect(() => {
      const targetDate = new Date('2025-07-15T17:11:00');
      
      const updateCountdown = () => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        
        if (difference <= 0) {
          setCountdown('Unlimited tokens ended');
          return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };
      
      // Update immediately
      updateCountdown();
      
      // Update every second
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      if (expoUrl) {
        setQrModalOpen(true);
      }
    }, [expoUrl]);

    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);

        // Extract token usage from usage annotations
        const usageAnnotation = data.find(
          (x) => typeof x === 'object' && (x as any).type === 'usage'
        ) as any;
        
        if (usageAnnotation?.value) {
          setTokenUsage({
            promptTokens: usageAnnotation.value.promptTokens || 0,
            completionTokens: usageAnnotation.value.completionTokens || 0,
            totalTokens: usageAnnotation.value.totalTokens || 0
          });
        }
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        let parsedApiKeys: Record<string, string> | undefined = {};

        try {
          parsedApiKeys = getApiKeysFromCookies();
          setApiKeys(parsedApiKeys);
        } catch (error) {
          console.error('Error loading API keys from cookies:', error);
          Cookies.remove('apiKeys');
        }

        setIsModelLoading('all');
        fetch('/api/models')
          .then((response) => response.json())
          .then((data) => {
            const typedData = data as { modelList: ModelInfo[] };
            setModelList(typedData.modelList);
          })
          .catch((error) => {
            console.error('Error fetching model list:', error);
          })
          .finally(() => {
            setIsModelLoading(undefined);
          });
      }
    }, [providerList, provider]);

    const onApiKeysChange = async (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));

      setIsModelLoading(providerName);

      let providerModels: ModelInfo[] = [];

      try {
        const response = await fetch(`/api/models/${encodeURIComponent(providerName)}`);
        const data = await response.json();
        providerModels = (data as { modelList: ModelInfo[] }).modelList;
      } catch (error) {
        console.error('Error loading dynamic models for:', providerName, error);
      }

      // Only update models for the specific provider
      setModelList((prevModels) => {
        const otherModels = prevModels.filter((model) => model.provider !== providerName);
        return [...otherModels, ...providerModels];
      });
      setIsModelLoading(undefined);
    };

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string, isFixRequest?: boolean) => {
      // Check token limits before sending (skip for fix requests)
      if (!isFixRequest) {
        try {
          const stored = localStorage.getItem('tokenUsage');
          if (stored) {
            const parsed = JSON.parse(stored);
            const today = new Date().toDateString();
            
            // Reset if it's a new day
            if (parsed.lastResetDate !== today) {
              // New day, tokens reset
            } else {
              const remainingTokens = 300000 - parsed.dailyTokensUsed;
              if (remainingTokens <= 0) {
                // Show upgrade modal or redirect to pricing
                window.location.href = '/pricing';
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error checking token limits:', error);
          // Continue with sending message if there's an error checking limits
        }
      }

      if (sendMessage) {
        sendMessage(event, messageInput, isFixRequest);
        setSelectedElement?.(null);

        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div className={classNames(styles.BaseChat, 'relative flex h-full w-full overflow-hidden')} data-chat-visible={showChat} ref={ref}>
        {showAIWarning && (
          <div className="absolute top-0 left-0 w-full bg-orange-500 text-white font-semibold z-50 flex items-center justify-center gap-2 px-4" style={{ fontSize: '15px', lineHeight: '2.2', minHeight: 'unset', height: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
            <span>AI issues resolved. But AI requests may STILL fail.</span>
            <button
              onClick={() => setShowAIWarning(false)}
              className="ml-2 text-white hover:text-gray-200 text-lg p-1 rounded transition-colors"
              style={{ lineHeight: 1 }}
              aria-label="Close AI warning"
            >
              ×
            </button>
          </div>
        )}
        <div className="absolute top-0 right-0 mt-2 mr-4 z-50" style={{ display: !chatStarted ? 'block' : 'none' }}>
          <a href="/pricing" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-200">
            {t('upgradePlan')}
          </a>
        </div>
        <div className="pt-[32px] w-full h-full">
          <ClientOnly>{() => <Menu />}</ClientOnly>
          <div className="flex flex-col lg:flex-row overflow-y-auto w-full h-full">
            <div className={classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full')}>
              {!chatStarted && (
                <div id="intro" className="mt-[16vh] max-w-2xl mx-auto text-center px-4 lg:px-0">
                  <h1 className="text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in whitespace-nowrap overflow-hidden text-ellipsis">
                    {t('ideaToApp')}
                  </h1>
                  <p className="text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200">
                    {t('buildFullstack')}
                  </p>
                  <div className="text-lg font-bold text-green-400 animate-fade-in animation-delay-400 mb-8">
                    ⏰ {t('unlimitedEnds')} {countdown}
                  </div>
                </div>
              )}
              <StickToBottom
                className={classNames('pt-6 px-2 sm:px-6 relative', {
                  'h-full flex flex-col modern-scrollbar': chatStarted,
                })}
                resize="smooth"
                initial="smooth"
              >
                <StickToBottom.Content className="flex flex-col gap-4 relative ">
                  <ClientOnly>
                    {() => {
                      return chatStarted ? (
                        <Messages
                          className="flex flex-col w-full flex-1 max-w-chat pb-4 mx-auto z-1"
                          messages={messages}
                          isStreaming={isStreaming}
                          append={append}
                          chatMode={chatMode}
                          setChatMode={setChatMode}
                          provider={provider}
                          model={model}
                        />
                      ) : null;
                    }}
                  </ClientOnly>
                  <ScrollToBottom />
                </StickToBottom.Content>
                <div
                  className={classNames('my-auto flex flex-col gap-2 w-full max-w-chat mx-auto z-prompt mb-6', {
                    'sticky bottom-2': chatStarted,
                  })}
                >
                  <div className="flex flex-col gap-2">
                    {deployAlert && (
                      <DeployChatAlert
                        alert={deployAlert}
                        clearAlert={() => clearDeployAlert?.()}
                        postMessage={(message: string | undefined) => {
                          sendMessage?.({} as any, message, false);
                          clearSupabaseAlert?.();
                        }}
                      />
                    )}
                    {supabaseAlert && (
                      <SupabaseChatAlert
                        alert={supabaseAlert}
                        clearAlert={() => clearSupabaseAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message, false);
                          clearSupabaseAlert?.();
                        }}
                      />
                    )}
                    {actionAlert && (
                      <ChatAlert
                        alert={actionAlert}
                        clearAlert={() => clearAlert?.()}
                        postMessage={(message, isFixRequest) => {
                          sendMessage?.({} as any, message, isFixRequest);
                          clearAlert?.();
                        }}
                      />
                    )}
                  </div>
                  {progressAnnotations && <ProgressCompilation data={progressAnnotations} />}
                  <TokenUsageTracker 
                    promptTokens={tokenUsage.promptTokens}
                    completionTokens={tokenUsage.completionTokens}
                    totalTokens={tokenUsage.totalTokens}
                  />
                  <ChatBox
                    isModelSettingsCollapsed={isModelSettingsCollapsed}
                    setIsModelSettingsCollapsed={setIsModelSettingsCollapsed}
                    provider={provider}
                    setProvider={setProvider}
                    providerList={providerList || (PROVIDER_LIST as ProviderInfo[])}
                    model={model}
                    setModel={setModel}
                    modelList={modelList}
                    apiKeys={apiKeys}
                    isModelLoading={isModelLoading}
                    onApiKeysChange={onApiKeysChange}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    imageDataList={imageDataList}
                    setImageDataList={setImageDataList}
                    textareaRef={textareaRef}
                    input={input}
                    handleInputChange={handleInputChange}
                    handlePaste={handlePaste}
                    TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                    TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                    isStreaming={isStreaming}
                    handleStop={handleStop}
                    handleSendMessage={handleSendMessage}
                    enhancingPrompt={enhancingPrompt}
                    enhancePrompt={enhancePrompt}
                    isListening={isListening}
                    startListening={startListening}
                    stopListening={stopListening}
                    chatStarted={chatStarted}
                    exportChat={exportChat}
                    qrModalOpen={qrModalOpen}
                    setQrModalOpen={setQrModalOpen}
                    handleFileUpload={handleFileUpload}
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    designScheme={designScheme}
                    setDesignScheme={setDesignScheme}
                    selectedElement={selectedElement}
                    setSelectedElement={setSelectedElement}
                  />
                </div>
              </StickToBottom>
              <div className="flex flex-col justify-center">
                {!chatStarted && (
                  <>
                    <div className="flex justify-center gap-2">
                      {ImportButtons(importChat)}
                      <GitCloneButton importChat={importChat} />
                    </div>
                    {/* Settings Button at the bottom */}
                    <div className="fixed bottom-6 left-0 w-full flex justify-center z-[100] pointer-events-none">
                      <div className="pointer-events-auto">
                        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
                      </div>
                    </div>
                    <DialogRoot open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                      <Dialog className="!w-[700px] !max-w-[95vw] !p-0 bg-gradient-to-br from-blue-700 via-black to-gray-950 border-0 shadow-2xl">
                        <div className="flex h-[480px]">
                          {/* Sidebar */}
                          <div className="flex flex-col w-48 bg-black/80 border-r border-blue-800 py-6 px-2 gap-2">
                            {settingsCategories.map((cat, idx) => (
                              <button
                                key={cat}
                                className={`text-left px-4 py-2 rounded-lg font-medium transition-colors
                                  ${settingsCategory === idx
                                    ? 'bg-blue-700 text-white shadow-md'
                                    : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900/40 hover:text-white border border-blue-900/40'}
                                `}
                                onClick={() => setSettingsCategory(idx)}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                          {/* Content */}
                          <div className="flex-1 flex flex-col items-center justify-center p-8 text-blue-100">
                            <h2 className="text-2xl font-bold mb-4 text-blue-200">{settingsCategories[settingsCategory]}</h2>
                            {settingsCategories[settingsCategory] === 'Integrations' && (
                              <div className="w-full flex flex-col items-center mb-8">
                                {/* Lovable Integration Box */}
                                <div className="w-full max-w-md bg-gradient-to-br from-pink-600/80 via-black/80 to-blue-700/80 border border-pink-400 rounded-2xl shadow-lg p-6 flex items-center gap-5 mb-4">
                                  <img src="/icons/lovable.svg" alt="Lovable" className="w-14 h-14 rounded-xl bg-white p-2 shadow" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl font-bold text-pink-100">Lovable</span>
                                      <span className="bg-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">COMING SOON</span>
                                    </div>
                                    <div className="text-pink-100 text-sm opacity-90">Build and import your Lovable apps right into here and continue editing!</div>
                                  </div>
                                </div>
                                {/* Stackblitz Integration Box */}
                                <div className="w-full max-w-md bg-gradient-to-br from-blue-800/80 via-black/80 to-gray-900/80 border border-blue-900 rounded-2xl shadow-lg p-6 flex items-center gap-5 mb-4">
                                  <img src="/icons/stackblitz.svg" alt="Stackblitz" className="w-14 h-14 rounded-xl bg-white p-2 shadow" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl font-bold text-blue-100">Stackblitz</span>
                                      <span className="bg-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">COMING SOON</span>
                                    </div>
                                    <div className="text-blue-200 text-sm opacity-90">Import your Stackblitz projects right into there and continue editing!</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {settingsCategories[settingsCategory] === 'Tokens' && (
                              <div className="w-full max-w-md bg-gradient-to-br from-blue-800/80 via-black/80 to-gray-900/80 border border-blue-900 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl font-bold text-blue-200">Unlimited tokens</span>
                                  <span className="bg-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">ACTIVE</span>
                                </div>
                                <div className="w-full mt-4">
                                  <div className="w-full h-4 bg-blue-950/60 rounded-full overflow-hidden border border-blue-900">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '100%' }}></div>
                                  </div>
                                  <div className="text-right text-xs text-blue-300 mt-1">100% left</div>
                                </div>
                                <div className="text-blue-200 text-sm opacity-90 mt-2">You currently have unlimited tokens. Enjoy building without limits!</div>
                              </div>
                            )}
                            {settingsCategories[settingsCategory] === 'General' && (
                              <div className="w-full max-w-md bg-gradient-to-br from-blue-800/80 via-black/80 to-gray-900/80 border border-blue-900 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4 mb-8">
                                <div className="w-full flex flex-col gap-4">
                                  <label className="text-blue-200 text-lg font-semibold mb-2">{t('settings.language')}</label>
                                  <div className="w-full flex justify-center">
                                    <Dropdown
                                      trigger={<button className="bg-blue-700 text-white px-4 py-2 rounded-lg shadow font-semibold text-base flex items-center gap-2 min-w-[180px]">{languages.find(l => l.code === language)?.label || t('settings.selectLanguage')}</button>}
                                    >
                                      {languages.map((lang) => (
                                        <DropdownItem
                                          key={lang.code}
                                          onSelect={() => setLanguage(lang.code)}
                                          className={language === lang.code ? 'bg-blue-600 text-white' : ''}
                                        >
                                          {lang.label}
                                        </DropdownItem>
                                      ))}
                                    </Dropdown>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="text-lg opacity-80">This is the <span className="text-blue-400">{t('settings.general')}</span> {t('settings.panel')}</div>
                          </div>
                        </div>
                      </Dialog>
                    </DialogRoot>
                  </>
                )}
                <div className="flex flex-col gap-5">
                  {!chatStarted &&
                    ExamplePrompts((event, messageInput) => {
                      if (isStreaming) {
                        handleStop?.();
                        return;
                      }

                      // Check token limits before sending
                      try {
                        const stored = localStorage.getItem('tokenUsage');
                        if (stored) {
                          const parsed = JSON.parse(stored);
                          const today = new Date().toDateString();
                          
                          if (parsed.lastResetDate === today) {
                            const remainingTokens = 300000 - parsed.dailyTokensUsed;
                            if (remainingTokens <= 0) {
                              window.location.href = '/pricing';
                              return;
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error checking token limits:', error);
                        // Continue with sending message if there's an error checking limits
                      }

                      handleSendMessage?.(event, messageInput);
                    })}
                  {!chatStarted && <StarterTemplates />}
                </div>
              </div>
            </div>
            <ClientOnly>
              {() => (
                <Workbench
                  actionRunner={actionRunner ?? ({} as ActionRunner)}
                  chatStarted={chatStarted}
                  isStreaming={isStreaming}
                  setSelectedElement={setSelectedElement}
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <>
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-bolt-elements-background-depth-1 to-transparent h-20 z-10" />
        <button
          className="sticky z-50 bottom-0 left-0 right-0 text-4xl rounded-lg px-1.5 py-0.5 flex items-center justify-center mx-auto gap-2 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor text-bolt-elements-textPrimary text-sm"
          onClick={() => scrollToBottom()}
        >
          Go to last message
          <span className="i-ph:arrow-down animate-bounce" />
        </button>
      </>
    )
  );
}
