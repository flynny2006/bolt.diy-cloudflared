import { AnimatePresence, motion } from 'framer-motion';
import type { ActionAlert } from '~/types/actions';
import { classNames } from '~/utils/classNames';

interface Props {
  alert: ActionAlert;
  clearAlert: () => void;
  postMessage: (message: string, isFixRequest?: boolean) => void;
}

export default function ChatAlert({ alert, clearAlert, postMessage }: Props) {
  const { description, content, source } = alert;

  const isPreview = source === 'preview';
  const title = isPreview ? 'Error' : 'Terminal Error';
  const message = isPreview
    ? 'Build Unsuccessful.'
    : 'We encountered an error while running terminal commands. Would you like Bolt to analyze and help resolve this issue?';

  return (
    <div className="w-full">
      <div className="w-full bg-red-600 text-white text-center font-semibold" style={{ fontSize: '15px', lineHeight: '2.2', minHeight: 'unset', height: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        We are currently experiencing some AI issues. AI requests may fail.
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-lg border border-[#6E4D34] bg-[#4A3628] p-4 mb-2`}
        >
          <div className="flex items-start">
            {/* Icon */}
            <motion.div
              className="flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`i-ph:warning-duotone text-xl text-[#FFD700]`}></div>
            </motion.div>
            {/* Content */}
            <div className="ml-3 flex-1">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`text-sm font-medium text-[#FFD700]`}
              >
                {title}
              </motion.h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`mt-2 text-sm text-[#E0C06A]`}
              >
                <p>{message}</p>
                {description && (
                  <div className="text-xs text-[#E0C06A] p-2 bg-bolt-elements-background-depth-3 rounded mt-4 mb-4">
                    Error: {description}
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className={classNames(' flex gap-2')}>
                  {isPreview ? (
                    <button
                      onClick={() =>
                        postMessage(
                          `*Fix this ${isPreview ? 'preview' : 'terminal'} error* \n\`\`\`${isPreview ? 'js' : 'sh'}\n${content}\n\`\`\`\n`,
                          true
                        )
                      }
                      className={classNames(
                        `px-2 py-1.5 rounded-md text-sm font-medium`,
                        'bg-bolt-elements-button-primary-background',
                        'hover:bg-bolt-elements-button-primary-backgroundHover',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-danger-background',
                        'text-bolt-elements-button-primary-text',
                        'flex items-center gap-1.5',
                      )}
                    >
                      <div className="i-ph:lightning-duotone"></div>
                      Try to fix
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        postMessage(
                          `*Fix this ${isPreview ? 'preview' : 'terminal'} error* \n\`\`\`${isPreview ? 'js' : 'sh'}\n${content}\n\`\`\`\n`,
                          true
                        )
                      }
                      className={classNames(
                        `px-2 py-1.5 rounded-md text-sm font-medium`,
                        'bg-bolt-elements-button-primary-background',
                        'hover:bg-bolt-elements-button-primary-backgroundHover',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-danger-background',
                        'text-bolt-elements-button-primary-text',
                        'flex items-center gap-1.5',
                      )}
                    >
                      <div className="i-ph:chat-circle-duotone"></div>
                      Ask Bolt to fix
                    </button>
                  )}
                  <button
                    onClick={clearAlert}
                    className={classNames(
                      `px-2 py-1.5 rounded-md text-sm font-medium`,
                      'bg-bolt-elements-button-secondary-background',
                      'hover:bg-bolt-elements-button-secondary-backgroundHover',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-secondary-background',
                      'text-bolt-elements-button-secondary-text',
                    )}
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
