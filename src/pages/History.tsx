import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  PhotoIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

type SortOption = 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'today' | 'week' | 'month';

export function History() {
  const { history, deleteHistoryItem, clearHistory } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 过滤和排序历史记录
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = history;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.imageName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 时间过滤
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(item => item.timestamp >= today);
        break;
      case 'week':
        filtered = filtered.filter(item => item.timestamp >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(item => item.timestamp >= monthAgo);
        break;
    }

    // 排序
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.imageName.localeCompare(b.imageName));
        break;
    }

    return filtered;
  }, [history, searchTerm, sortBy, filterBy]);

  const handleCopyPrompt = async (id: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedHistory.map(item => item.id)));
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => deleteHistoryItem(id));
    setSelectedItems(new Set());
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
          <p className="mt-2 text-gray-600">
            共 {history.length} 条记录，显示 {filteredAndSortedHistory.length} 条
          </p>
        </div>
        
        {history.length > 0 && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                删除选中 ({selectedItems.size})
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
                  clearHistory();
                  setSelectedItems(new Set());
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              清空全部
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无历史记录</h3>
          <p className="mt-1 text-sm text-gray-500">
            开始分析图片后，历史记录将显示在这里
          </p>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索提示词或图片名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FunnelIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">筛选:</span>
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">最近一周</option>
                  <option value="month">最近一月</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">最新优先</option>
                  <option value="oldest">最旧优先</option>
                  <option value="name">按名称</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {filteredAndSortedHistory.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredAndSortedHistory.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    全选 ({filteredAndSortedHistory.length} 项)
                  </span>
                </label>
                
                {selectedItems.size > 0 && (
                  <span className="text-sm text-blue-600">
                    已选择 {selectedItems.size} 项
                  </span>
                )}
              </div>
            )}
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredAndSortedHistory.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'bg-white rounded-lg shadow-sm border p-6 transition-all',
                  selectedItems.has(item.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                )}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.imageName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.imageName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyPrompt(item.id, item.prompt)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="复制提示词"
                        >
                          {copiedId === item.id ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="删除记录"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {truncateText(item.prompt, 200)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {item.timestamp.toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredAndSortedHistory.length === 0 && (
            <div className="text-center py-8">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">未找到匹配的记录</h3>
              <p className="mt-1 text-sm text-gray-500">
                尝试调整搜索条件或筛选选项
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}