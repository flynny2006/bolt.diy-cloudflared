import type { ProviderInfo } from '~/types/model';
import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { classNames } from '~/utils/classNames';

interface ModelSelectorProps {
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  modelList: ModelInfo[];
  providerList: ProviderInfo[];
  apiKeys: Record<string, string>;
  modelLoading?: string;
}

export const ModelSelector = ({
  model,
  setModel,
  provider,
  setProvider,
  modelList,
  providerList,
  modelLoading,
}: ModelSelectorProps) => {
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [focusedModelIndex, setFocusedModelIndex] = useState(-1);
  const modelSearchInputRef = useRef<HTMLInputElement>(null);
  const modelOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [focusedProviderIndex, setFocusedProviderIndex] = useState(-1);
  const providerSearchInputRef = useRef<HTMLInputElement>(null);
  const providerOptionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
      }

      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
        setProviderSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = [...modelList]
    .filter((e) => e.provider === provider?.name && e.name)
    .filter(
      (model) =>
        model.label.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()),
    )
    .map(model => ({
      ...model,
      isAvailable: model.label === "Gemini 2.5 Flash Preview" || 
                   model.name === "gemini-2.5-flash-preview" ||
                   model.label === "Gemini 2.5 Flash - context 1114k" ||
                   model.name === "gemini-2.5-flash-1114k" ||
                   model.label === "GPT-3.5 Turbo" ||
                   model.name === "gpt-3.5-turbo" ||
                   model.label === "GPT-4o Mini" ||
                   model.name === "gpt-4o-mini" ||
                   model.label === "GPT-4o" ||
                   model.name === "gpt-4o" ||
                   model.label === "Claude 3.5 Haiku (new)" ||
                   model.name === "claude-3-5-haiku-latest" ||
                   model.label === "Claude 3 Haiku" ||
                   model.name === "claude-3-haiku-20240307"
    }))
    .filter(model => model.isAvailable);

  const filteredProviders = providerList.filter((p) =>
    p.name.toLowerCase().includes(providerSearchQuery.toLowerCase()),
  );

  useEffect(() => {
    setFocusedModelIndex(-1);
    // If there are models, focus on the first one
    if (filteredModels.length > 0) {
      setFocusedModelIndex(0);
    }
  }, [modelSearchQuery, isModelDropdownOpen]);

  useEffect(() => {
    setFocusedProviderIndex(-1);
  }, [providerSearchQuery, isProviderDropdownOpen]);

  useEffect(() => {
    if (isModelDropdownOpen && modelSearchInputRef.current) {
      modelSearchInputRef.current.focus();
    }
  }, [isModelDropdownOpen]);

  useEffect(() => {
    if (isProviderDropdownOpen && providerSearchInputRef.current) {
      providerSearchInputRef.current.focus();
    }
  }, [isProviderDropdownOpen]);

  const handleModelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isModelDropdownOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev + 1 >= filteredModels.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedModelIndex((prev) => (prev - 1 < 0 ? filteredModels.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();

        if (focusedModelIndex >= 0 && focusedModelIndex < filteredModels.length) {
          const selectedModel = filteredModels[focusedModelIndex];
          setModel?.(selectedModel.name);
          setIsModelDropdownOpen(false);
          setModelSearchQuery('');
        }

        break;
      case 'Escape':
        e.preventDefault();
        setIsModelDropdownOpen(false);
        setModelSearchQuery('');
        break;
      case 'Tab':
        if (!e.shiftKey && focusedModelIndex === filteredModels.length - 1) {
          setIsModelDropdownOpen(false);
        }

        break;
    }
  };

  const handleProviderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isProviderDropdownOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedProviderIndex((prev) => (prev + 1 >= filteredProviders.length ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedProviderIndex((prev) => (prev - 1 < 0 ? filteredProviders.length - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();

        if (focusedProviderIndex >= 0 && focusedProviderIndex < filteredProviders.length) {
          const selectedProvider = filteredProviders[focusedProviderIndex];

          if (setProvider) {
            setProvider(selectedProvider);

            // Get models for the selected provider
            const providerModels = modelList
              .filter((m) => m.provider === selectedProvider.name)
              .map(model => ({
                ...model,
                isAvailable: model.label === "Gemini 2.5 Flash Preview" || 
                             model.name === "gemini-2.5-flash-preview" ||
                             model.label === "Gemini 2.5 Flash - context 1114k" ||
                             model.name === "gemini-2.5-flash-1114k" ||
                             model.label === "GPT-3.5 Turbo" ||
                             model.name === "gpt-3.5-turbo" ||
                             model.label === "GPT-4o Mini" ||
                             model.name === "gpt-4o-mini" ||
                             model.label === "GPT-4o" ||
                             model.name === "gpt-4o" ||
                             model.label === "Claude 3.5 Haiku (new)" ||
                             model.name === "claude-3-5-haiku-latest" ||
                             model.label === "Claude 3 Haiku" ||
                             model.name === "claude-3-haiku-20240307"
              }))
              .filter(model => model.isAvailable);

            if (providerModels.length > 0 && setModel) {
              // Try to find a free model first
              const freeModels = [
                "gpt-3.5-turbo",
                "claude-3-5-haiku-latest", 
                "claude-3-haiku-20240307"
              ];
              
              const freeModel = providerModels.find(model => 
                freeModels.includes(model.name) || 
                freeModels.includes(model.label)
              );
              
              if (freeModel) {
                setModel(freeModel.name);
              } else {
                // If no free model, select the first available
                setModel(providerModels[0].name);
              }
            }
          }

          setIsProviderDropdownOpen(false);
          setProviderSearchQuery('');
        }

        break;
      case 'Escape':
        e.preventDefault();
        setIsProviderDropdownOpen(false);
        setProviderSearchQuery('');
        break;
      case 'Tab':
        if (!e.shiftKey && focusedProviderIndex === filteredProviders.length - 1) {
          setIsProviderDropdownOpen(false);
        }

        break;
    }
  };

  useEffect(() => {
    if (focusedModelIndex >= 0 && modelOptionsRef.current[focusedModelIndex]) {
      modelOptionsRef.current[focusedModelIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedModelIndex]);

  useEffect(() => {
    if (focusedProviderIndex >= 0 && providerOptionsRef.current[focusedProviderIndex]) {
      providerOptionsRef.current[focusedProviderIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedProviderIndex]);

  useEffect(() => {
    if (providerList.length === 0) {
      return;
    }

    if (provider && !providerList.some((p) => p.name === provider.name)) {
      const firstEnabledProvider = providerList[0];
      setProvider?.(firstEnabledProvider);

      // Get models for the selected provider
      const providerModels = modelList
        .filter((m) => m.provider === firstEnabledProvider.name)
        .map(model => ({
          ...model,
          isAvailable: model.label === "Gemini 2.5 Flash Preview" || 
                       model.name === "gemini-2.5-flash-preview" ||
                       model.label === "Gemini 2.5 Flash - context 1114k" ||
                       model.name === "gemini-2.5-flash-1114k" ||
                       model.label === "GPT-3.5 Turbo" ||
                       model.name === "gpt-3.5-turbo" ||
                       model.label === "GPT-4o Mini" ||
                       model.name === "gpt-4o-mini" ||
                       model.label === "GPT-4o" ||
                       model.name === "gpt-4o" ||
                       model.label === "Claude 3.5 Haiku (new)" ||
                       model.name === "claude-3-5-haiku-latest" ||
                       model.label === "Claude 3 Haiku" ||
                       model.name === "claude-3-haiku-20240307"
        }))
        .filter(model => model.isAvailable);

      if (providerModels.length > 0 && setModel) {
        // Try to find a free model first
        const freeModels = [
          "gpt-3.5-turbo",
          "claude-3-5-haiku-latest", 
          "claude-3-haiku-20240307"
        ];
        
        const freeModel = providerModels.find(model => 
          freeModels.includes(model.name) || 
          freeModels.includes(model.label)
        );
        
        if (freeModel) {
          setModel(freeModel.name);
        } else {
          // If no free model, select the first available
          setModel(providerModels[0].name);
        }
      }
    }
  }, [providerList, provider, setProvider, modelList, setModel]);

  // Function to get the first available free model
  const getFirstFreeModel = () => {
    const freeModels = [
      "gpt-3.5-turbo",
      "claude-3-5-haiku-latest", 
      "claude-3-haiku-20240307"
    ];
    
    return filteredModels.find(model => 
      freeModels.includes(model.name) || 
      freeModels.includes(model.label)
    );
  };

  // Ensure a free model is selected by default
  useEffect(() => {
    if (filteredModels.length > 0 && !model) {
      const freeModel = getFirstFreeModel();
      if (freeModel && setModel) {
        setModel(freeModel.name);
      } else if (setModel) {
        // If no free model found, select the first available model
        setModel(filteredModels[0].name);
      }
    }
  }, [filteredModels, model, setModel]);

  if (providerList.length === 0) {
    return (
      <div className="mb-2 p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary">
        <p className="text-center">
          No providers are currently enabled. Please enable at least one provider in the settings to start using the
          chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      {/* Provider Combobox */}
      <div className="relative flex w-full" onKeyDown={handleProviderKeyDown} ref={providerDropdownRef}>
        <div
          className={classNames(
            'w-full px-4 py-2 rounded-2xl border border-white/10 dark:border-blue-900/60 bg-white/5 dark:bg-black/40 shadow-2xl backdrop-blur-lg text-white text-base font-medium transition-all duration-200 cursor-pointer ModernSelector',
            isProviderDropdownOpen ? 'ring-2 ring-blue-500/40 border-blue-500/40' : '',
          )}
          onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsProviderDropdownOpen(!isProviderDropdownOpen);
            }
          }}
          role="combobox"
          aria-expanded={isProviderDropdownOpen}
          aria-controls="provider-listbox"
          aria-haspopup="listbox"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="truncate">{provider?.name || 'Select provider'}</div>
            <div
              className={classNames(
                'i-ph:caret-down w-4 h-4 text-white opacity-75',
                isProviderDropdownOpen ? 'rotate-180' : undefined,
              )}
            />
          </div>
        </div>

        {isProviderDropdownOpen && (
          <div
            className="absolute z-20 w-full mt-1 py-2 rounded-2xl border border-white/10 dark:border-blue-900/60 bg-white/10 dark:bg-black/80 shadow-2xl ModernSelectorDropdown backdrop-blur-lg"
            role="listbox"
            id="provider-listbox"
          >
            <div className="px-2 pb-2">
              <div className="relative">
                <input
                  ref={providerSearchInputRef}
                  type="text"
                  value={providerSearchQuery}
                  onChange={(e) => setProviderSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  className={classNames(
                    'w-full pl-2 py-1.5 rounded-md text-sm',
                    'bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor',
                    'text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary',
                    'focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus',
                    'transition-all',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  role="searchbox"
                  aria-label="Search providers"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <span className="i-ph:magnifying-glass text-bolt-elements-textTertiary" />
                </div>
              </div>
            </div>

            <div
              className={classNames(
                'max-h-60 overflow-y-auto',
                'sm:scrollbar-none',
                '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
                '[&::-webkit-scrollbar-thumb]:bg-bolt-elements-borderColor',
                '[&::-webkit-scrollbar-thumb]:hover:bg-bolt-elements-borderColorHover',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-track]:bg-bolt-elements-background-depth-2',
                '[&::-webkit-scrollbar-track]:rounded-full',
                'sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:h-1.5',
                'sm:hover:[&::-webkit-scrollbar-thumb]:bg-bolt-elements-borderColor/50',
                'sm:hover:[&::-webkit-scrollbar-thumb:hover]:bg-bolt-elements-borderColor',
                'sm:[&::-webkit-scrollbar-track]:bg-transparent',
              )}
            >
              {filteredProviders.length === 0 ? (
                <div className="px-3 py-2 text-sm text-bolt-elements-textTertiary">No providers found</div>
              ) : (
                filteredProviders.map((providerOption, index) => (
                  <div
                    ref={(el) => (providerOptionsRef.current[index] = el)}
                    key={providerOption.name}
                    role="option"
                    aria-selected={provider?.name === providerOption.name}
                    className={classNames(
                      'px-3 py-2 text-sm cursor-pointer',
                      'hover:bg-bolt-elements-background-depth-3',
                      'text-bolt-elements-textPrimary',
                      'outline-none',
                      provider?.name === providerOption.name || focusedProviderIndex === index
                        ? 'bg-bolt-elements-background-depth-2'
                        : undefined,
                      focusedProviderIndex === index ? 'ring-1 ring-inset ring-bolt-elements-focus' : undefined,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (setProvider) {
                        setProvider(providerOption);

                        // Get models for the selected provider
                        const providerModels = modelList
                          .filter((m) => m.provider === providerOption.name)
                          .map(model => ({
                            ...model,
                            isAvailable: model.label === "Gemini 2.5 Flash Preview" || 
                                         model.name === "gemini-2.5-flash-preview" ||
                                         model.label === "Gemini 2.5 Flash - context 1114k" ||
                                         model.name === "gemini-2.5-flash-1114k" ||
                                         model.label === "GPT-3.5 Turbo" ||
                                         model.name === "gpt-3.5-turbo" ||
                                         model.label === "GPT-4o Mini" ||
                                         model.name === "gpt-4o-mini" ||
                                         model.label === "GPT-4o" ||
                                         model.name === "gpt-4o" ||
                                         model.label === "Claude 3.5 Haiku (new)" ||
                                         model.name === "claude-3-5-haiku-latest" ||
                                         model.label === "Claude 3 Haiku" ||
                                         model.name === "claude-3-haiku-20240307"
                          }))
                          .filter(model => model.isAvailable);

                        if (providerModels.length > 0 && setModel) {
                          // Try to find a free model first
                          const freeModels = [
                            "gpt-3.5-turbo",
                            "claude-3-5-haiku-latest", 
                            "claude-3-haiku-20240307"
                          ];
                          
                          const freeModel = providerModels.find(model => 
                            freeModels.includes(model.name) || 
                            freeModels.includes(model.label)
                          );
                          
                          if (freeModel) {
                            setModel(freeModel.name);
                          } else {
                            // If no free model, select the first available
                            setModel(providerModels[0].name);
                          }
                        }
                      }

                      setIsProviderDropdownOpen(false);
                      setProviderSearchQuery('');
                    }}
                    tabIndex={focusedProviderIndex === index ? 0 : -1}
                  >
                    {providerOption.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Model Combobox */}
      <div className="relative flex w-full min-w-[70%]" onKeyDown={handleModelKeyDown} ref={modelDropdownRef}>
        <div
          className={classNames(
            'w-full px-4 py-2 rounded-2xl border border-white/10 dark:border-blue-900/60 bg-white/5 dark:bg-black/40 shadow-2xl backdrop-blur-lg text-white text-base font-medium transition-all duration-200 cursor-pointer ModernSelector',
            isModelDropdownOpen ? 'ring-2 ring-blue-500/40 border-blue-500/40' : '',
          )}
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsModelDropdownOpen(!isModelDropdownOpen);
            }
          }}
          role="combobox"
          aria-expanded={isModelDropdownOpen}
          aria-controls="model-listbox"
          aria-haspopup="listbox"
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="truncate">{modelList.find((m) => m.name === model)?.label || 'Select model'}</div>
            <div
              className={classNames(
                'i-ph:caret-down w-4 h-4 text-white opacity-75',
                isModelDropdownOpen ? 'rotate-180' : undefined,
              )}
            />
          </div>
        </div>

        {isModelDropdownOpen && (
          <div
            className="absolute z-10 w-full mt-1 py-2 rounded-2xl border border-white/10 dark:border-blue-900/60 bg-white/10 dark:bg-black/80 shadow-2xl ModernSelectorDropdown backdrop-blur-lg"
            role="listbox"
            id="model-listbox"
          >
            <div className="px-2 pb-2">
              <div className="relative">
                <input
                  ref={modelSearchInputRef}
                  type="text"
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className={classNames(
                    'w-full pl-2 py-1.5 rounded-md text-sm',
                    'bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor',
                    'text-bolt-elements-textPrimary placeholder:text-bolt-elements-textTertiary',
                    'focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus',
                    'transition-all',
                  )}
                  onClick={(e) => e.stopPropagation()}
                  role="searchbox"
                  aria-label="Search models"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <span className="i-ph:magnifying-glass text-bolt-elements-textTertiary" />
                </div>
              </div>
            </div>

            <div
              className={classNames(
                'max-h-60 overflow-y-auto',
                'sm:scrollbar-none',
                '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2',
                '[&::-webkit-scrollbar-thumb]:bg-bolt-elements-borderColor',
                '[&::-webkit-scrollbar-thumb]:hover:bg-bolt-elements-borderColorHover',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
                '[&::-webkit-scrollbar-track]:bg-bolt-elements-background-depth-2',
                '[&::-webkit-scrollbar-track]:rounded-full',
                'sm:[&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:h-1.5',
                'sm:hover:[&::-webkit-scrollbar-thumb]:bg-bolt-elements-borderColor/50',
                'sm:hover:[&::-webkit-scrollbar-thumb:hover]:bg-bolt-elements-borderColor',
                'sm:[&::-webkit-scrollbar-track]:bg-transparent',
              )}
            >
              {modelLoading === 'all' || modelLoading === provider?.name ? (
                <div className="px-3 py-2 text-sm text-bolt-elements-textTertiary">Loading...</div>
              ) : filteredModels.length === 0 ? (
                <div className="px-3 py-2 text-sm text-bolt-elements-textTertiary">No models found</div>
              ) : (
                filteredModels.map((modelOption, index) => (
                  <div
                    ref={(el) => (modelOptionsRef.current[index] = el)}
                    key={index} // Consider using modelOption.name if unique
                    role="option"
                    aria-selected={model === modelOption.name}
                    className={classNames(
                      'px-3 py-2 text-sm cursor-pointer',
                      'hover:bg-bolt-elements-background-depth-3',
                      'text-bolt-elements-textPrimary',
                      'outline-none',
                      model === modelOption.name || focusedModelIndex === index
                        ? 'bg-bolt-elements-background-depth-2'
                        : undefined,
                      focusedModelIndex === index ? 'ring-1 ring-inset ring-bolt-elements-focus' : undefined,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModel?.(modelOption.name);
                      setIsModelDropdownOpen(false);
                      setModelSearchQuery('');
                    }}
                    tabIndex={focusedModelIndex === index ? 0 : -1}
                  >
                    {modelOption.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
