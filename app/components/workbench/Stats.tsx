import { useStore } from '@nanostores/react';
import { memo, useMemo } from 'react';
import { workbenchStore } from '~/lib/stores/workbench';
import { getLanguageFromExtension } from '~/utils/getLanguageFromExtension';
import { formatSize } from '~/utils/formatSize';

export const Stats = memo(() => {
  const files = useStore(workbenchStore.files);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const selectedFile = useStore(workbenchStore.selectedFile);

  const stats = useMemo(() => {
    const fileEntries = Object.entries(files);
    const totalFiles = fileEntries.length;
    const totalFolders = fileEntries.filter(([, dirent]) => dirent?.type === 'folder').length;
    const totalCodeFiles = fileEntries.filter(([, dirent]) => dirent?.type === 'file').length;
    
    // Calculate file sizes
    const totalSize = fileEntries.reduce((acc, [, dirent]) => {
      if (dirent?.type === 'file' && dirent.content) {
        return acc + (typeof dirent.content === 'string' ? dirent.content.length : 0);
      }
      return acc;
    }, 0);

    // Language breakdown
    const languageStats = fileEntries.reduce((acc, [filePath, dirent]) => {
      if (dirent?.type === 'file') {
        const extension = filePath.split('.').pop() || '';
        const language = getLanguageFromExtension(extension);
        acc[language] = (acc[language] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Top languages
    const topLanguages = Object.entries(languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalFiles,
      totalFolders,
      totalCodeFiles,
      totalSize,
      topLanguages,
      unsavedCount: unsavedFiles.size,
    };
  }, [files, unsavedFiles]);

  const StatCard = ({ title, value, icon, color = 'blue', subtitle }: {
    title: string;
    value: string | number;
    icon: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
    };

    return (
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white shadow-md`}>
            <div className={`${icon} text-xl`} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</div>
            {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  const LanguageCard = ({ language, count, percentage }: {
    language: string;
    count: number;
    percentage: number;
  }) => {
    const getLanguageIcon = (lang: string) => {
      const icons: Record<string, string> = {
        typescript: 'i-ph:file-ts',
        javascript: 'i-ph:file-js',
        jsx: 'i-ph:file-js',
        tsx: 'i-ph:file-ts',
        css: 'i-ph:paint-brush',
        scss: 'i-ph:paint-brush',
        less: 'i-ph:paint-brush',
        html: 'i-ph:code',
        json: 'i-ph:brackets-curly',
        python: 'i-ph:file-text',
        markdown: 'i-ph:article',
        yaml: 'i-ph:file-text',
        yml: 'i-ph:file-text',
        sql: 'i-ph:database',
        dockerfile: 'i-ph:cube',
        shell: 'i-ph:terminal',
      };
      return icons[lang] || 'i-ph:file-text';
    };

    return (
      <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-200/50 dark:border-blue-700/50 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <div className={`${getLanguageIcon(language)} text-sm`} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white capitalize">{language}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{count} files</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{percentage}%</div>
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto modern-terminal-scrollbar p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of your project</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Files"
            value={stats.totalFiles}
            icon="i-ph:files"
            color="blue"
            subtitle="All files in project"
          />
          <StatCard
            title="Code Files"
            value={stats.totalCodeFiles}
            icon="i-ph:code"
            color="green"
            subtitle="Source code files"
          />
          <StatCard
            title="Folders"
            value={stats.totalFolders}
            icon="i-ph:folder"
            color="purple"
            subtitle="Directory count"
          />
          <StatCard
            title="Unsaved"
            value={stats.unsavedCount}
            icon="i-ph:warning"
            color="orange"
            subtitle="Files with changes"
          />
        </div>

        {/* Project Size */}
        <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <div className="i-ph:hard-drives text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Size</h2>
              <p className="text-gray-600 dark:text-gray-400">Total content size</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatSize(stats.totalSize)}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
              <div className="i-ph:chart-pie text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language Breakdown</h2>
              <p className="text-gray-600 dark:text-gray-400">Top programming languages</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats.topLanguages.map(([language, count]) => {
              const percentage = Math.round((count / stats.totalCodeFiles) * 100);
              return (
                <LanguageCard
                  key={language}
                  language={language}
                  count={count}
                  percentage={percentage}
                />
              );
            })}
          </div>
        </div>

        {/* Current File Info */}
        {selectedFile && (
          <div className="bg-gradient-to-r from-green-50/80 to-green-100/60 dark:from-green-950/40 dark:to-green-900/30 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white">
                <div className="i-ph:file-text text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Currently Selected</h2>
                <p className="text-gray-600 dark:text-gray-400">Active file information</p>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <div className={`${getLanguageFromExtension(selectedFile.split('.').pop() || '') === 'typescript' ? 'i-ph:file-ts' : 'i-ph:file-text'} text-sm`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedFile.split('/').pop()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{selectedFile}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {unsavedFiles.has(selectedFile) ? 'Modified' : 'Saved'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}); 