import React, { useEffect, useState } from 'react'

interface ElementInfo {
  tagName: string
  className: string
  width: number
  height: number
  computedStyles: {
    width: string
    height: string
    transform: string
    scale: string
  }
}

const ElementSizeDebugger: React.FC = () => {
  const [largeElements, setLargeElements] = useState<ElementInfo[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const findLargeElements = () => {
    const elements = document.querySelectorAll('*')
    const large: ElementInfo[] = []

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(el)
      
      // 检查是否有异常大的元素（宽度或高度超过视口的2倍）
      if (rect.width > window.innerWidth * 2 || rect.height > window.innerHeight * 2) {
        large.push({
          tagName: el.tagName,
          className: el.className.toString(),
          width: rect.width,
          height: rect.height,
          computedStyles: {
            width: computedStyle.width,
            height: computedStyle.height,
            transform: computedStyle.transform,
            scale: computedStyle.scale || 'none'
          }
        })
      }
    })

    setLargeElements(large)
  }

  useEffect(() => {
    // 页面加载后检查
    const timer = setTimeout(findLargeElements, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
        >
          调试工具
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">元素尺寸调试器</h3>
          <div className="space-x-2">
            <button
              onClick={findLargeElements}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              重新扫描
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              关闭
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {largeElements.length === 0 ? (
            <p className="text-green-600 font-medium">✅ 未发现异常大的元素</p>
          ) : (
            <div>
              <p className="text-red-600 font-medium mb-4">⚠️ 发现 {largeElements.length} 个异常大的元素：</p>
              <div className="space-y-3">
                {largeElements.map((el, index) => (
                  <div key={index} className="border border-red-200 rounded p-3 bg-red-50">
                    <div className="font-medium text-red-800">
                      {el.tagName} {el.className && `(.${el.className.split(' ').join('.')})`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>实际尺寸: {Math.round(el.width)}px × {Math.round(el.height)}px</div>
                      <div>CSS宽度: {el.computedStyles.width}</div>
                      <div>CSS高度: {el.computedStyles.height}</div>
                      {el.computedStyles.transform !== 'none' && (
                        <div>Transform: {el.computedStyles.transform}</div>
                      )}
                      {el.computedStyles.scale !== 'none' && (
                        <div>Scale: {el.computedStyles.scale}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          <p><strong>说明：</strong> 此工具检测宽度或高度超过视口2倍的元素</p>
          <p><strong>视口尺寸：</strong> {window.innerWidth}px × {window.innerHeight}px</p>
        </div>
      </div>
    </div>
  )
}

export default ElementSizeDebugger