'use client';

import React, { useState } from 'react';
import { FileText, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Citation, Language } from '@/types';
import { getTranslation } from '@/lib/i18n/translations';

interface SourceCitationProps {
  citation: Citation;
  language: Language;
}

export default function SourceCitation({ citation, language }: SourceCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = getTranslation(language);
  
  const relevancePercentage = Math.round(citation.relevanceScore * 100);
  const relevanceColor = 
    relevancePercentage >= 80 ? 'text-green-600 dark:text-green-400' :
    relevancePercentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-gray-600 dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="citation-card cursor-pointer hover:shadow-md transition-all"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                {citation.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {citation.source} • {citation.metadata?.author || 'Unknown'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1 ${relevanceColor}`}>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">{relevancePercentage}%</span>
              </div>
              
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
            {citation.snippet}
          </p>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <div className="space-y-2">
                    {citation.metadata?.lastUpdated && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{t.lastUpdated}:</span>
                        <span>{new Date(citation.metadata.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {citation.metadata?.version && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{t.version}:</span>
                        <span>{citation.metadata.version}</span>
                      </div>
                    )}
                    
                    {citation.metadata?.documentId && (
                      <button className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        <span>{t.viewFullDocument}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}