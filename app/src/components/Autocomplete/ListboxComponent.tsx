import { Children, cloneElement, createContext, forwardRef, PropsWithChildren, useContext, useEffect, useRef } from 'react'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { useMediaQuery, useTheme } from '@mui/material'

const LISTBOX_PADDING = 8
const MAX_ITEMS = 8
function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  return cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  })
}

const OuterElementContext = createContext({})

/* eslint-disable react/display-name */
const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})
const InnerElementType = forwardRef<HTMLUListElement>((props, ref) => (
  <ul ref={ref} {...props} style={{ margin: 0 }} />
))
/* eslint-enable react/display-name */

function useResetCache(data: any) {
  const ref = useRef<VariableSizeList>(null)
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [data])
  return ref
}

// Adapter for react-window
const ListboxComponent = forwardRef<HTMLDivElement, HTMLDivElement>(
  (props: PropsWithChildren<any>, ref) => {
    const { children, ...other } = props
    const itemData = Children.toArray(children)
    const theme = useTheme()
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true })
    const itemCount = itemData.length
    const itemSize = smUp ? 36 : 48

    const getHeight = () => {
      if (itemCount > MAX_ITEMS) {
        return MAX_ITEMS * itemSize
      }
      return itemSize * itemCount
    }

    const gridRef = useResetCache(itemCount)

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType={InnerElementType}
            itemSize={() => itemSize}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    )
  },
)
ListboxComponent.displayName = 'ListboxComponent'

export default ListboxComponent
