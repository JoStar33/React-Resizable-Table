import React, { HTMLAttributes } from "react";
import styled, { css } from "styled-components";

type TSort = "center" | "start" | "end";

export interface IHeaderData {
  element: string;
  isResizable?: boolean;
  justifyContents?: TSort;
  minWidth?: number;
  maxWidth?: number;
}

interface IHeader {
  headerData: IHeaderData;
  ref: React.RefObject<HTMLTableHeaderCellElement>;
}

interface ITd extends HTMLAttributes<HTMLTableDataCellElement> {
  justifyContents?: TSort;
  children: React.ReactNode;
}

interface ITh extends HTMLAttributes<HTMLTableHeaderCellElement> {
  headerData: IHeaderData;
  columnIndex: number;
  tableHeight: number | string;
  checkBox?: React.ReactNode;
  handleResizerMouseDown: (
    index: number,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  isLastIndex: boolean;
  activeChecker: (columnIndex: number) => "active" | "idle";
}

const createHeaders = (headers: IHeaderData[]): IHeader[] => {
  return headers.map((headerElement) => ({
    headerData: headerElement,
    ref: React.useRef<HTMLTableHeaderCellElement>(null),
  }));
};

interface IEmpty {
  isEmpty: boolean;
}

interface IResizableTable {
  checkBox?: React.ReactNode;
  headers: IHeaderData[];
  children: React.ReactNode;
  empty?: IEmpty;
  exceptColumn?: string;
}

const checkBoxHeader: IHeaderData = {
  element: "checkBox",
  isResizable: false,
  minWidth: 80,
  maxWidth: 80,
  justifyContents: "center",
};

const computedJustify: Record<TSort, string> = {
  center: "center",
  start: "flex-start",
  end: "flex-end",
};

const MIN_HEIGHT = 96;

const MIN_WIDTH = 150;

export function StaticTable({
  checkBox,
  headers,
  children,
  empty,
  exceptColumn,
}: IResizableTable) {
  const calculateHeader = headers.map((headerElement) => ({
    ...headerElement,
    isResizable: headerElement.isResizable === undefined,
    minWidth: headerElement.minWidth ?? MIN_WIDTH,
  }));

  const verifiedHeaders: IHeaderData[] = checkBox
    ? [checkBoxHeader, ...calculateHeader]
    : calculateHeader;

  return (
    <S.StaticTable headers={verifiedHeaders} exceptColumn={exceptColumn}>
      {verifiedHeaders.map((header, _id) => {
        // eslint-disable-next-line array-callback-return
        if (exceptColumn === header.element) return;
        return (
          <th
            key={`static-header-${_id}`}
            style={{
              justifyContent:
                computedJustify[header.justifyContents ?? "center"],
            }}
          >
            {header.element === "checkBox" && checkBox ? (
              checkBox
            ) : (
              <span>{header.element}</span>
            )}
          </th>
        );
      })}
      {!empty?.isEmpty && <tbody>{children}</tbody>}
    </S.StaticTable>
  );
}

export default function ResizableTable({
  checkBox,
  headers,
  children,
  empty,
  exceptColumn,
}: IResizableTable) {
  const [tableHeight, setTableHeight] = React.useState<string | number>("auto");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const [isTableDragging, setIsTableDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState<number>(0);
  const [currentScrollX, setCurrentScrollX] = React.useState<number>(0);

  const calculateHeader = headers.map((headerElement) => ({
    ...headerElement,
    isResizable: headerElement.isResizable ?? true,
    minWidth: headerElement.minWidth ?? MIN_WIDTH,
  }));

  const tableElement = React.useRef<HTMLTableElement>(null);

  const activeChecker = (columnIndex: number) =>
    activeIndex === columnIndex ? "active" : "idle";

  const verifiedHeaders: IHeaderData[] = checkBox
    ? [checkBoxHeader, ...calculateHeader]
    : calculateHeader;

  const columns = createHeaders(verifiedHeaders);

  const isLastIndex = (columnIndex: number) =>
    columnIndex + 1 === columns.length;

  const valueAwayFromBody = React.useMemo(() => {
    if (!tableElement.current) return 0;
    return tableElement.current.getBoundingClientRect().left;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableElement.current?.getBoundingClientRect().left]);

  const computeGridColumn = React.useCallback(
    (column: IHeader, columnIndex: number, event: MouseEvent) => {
      if (!(column.ref.current && tableElement.current)) return;
      const computedColumnMinWidth = column.headerData.minWidth ?? MIN_WIDTH;
      if (
        isLastIndex(columnIndex) &&
        event.clientX > tableElement.current.scrollLeft
      ) {
        column.ref.current.style.minWidth = `${computedColumnMinWidth}px`;
        return `auto`;
      }
      if (columnIndex === activeIndex) {
        const calculateColumnWidth =
          event.clientX -
          column.ref.current.offsetLeft +
          tableElement.current.scrollLeft -
          valueAwayFromBody;
        if (calculateColumnWidth > computedColumnMinWidth)
          return `${calculateColumnWidth}px`;
      }
      return `${column.ref.current.offsetWidth}px`;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex]
  );

  const handleResizerMouseDown = (
    index: number,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (empty?.isEmpty) return;

    event.stopPropagation();
    setActiveIndex(index);
  };

  const handleResizerMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!tableElement.current) return;

      const gridColumns = columns.map((column, columnIndex) =>
        computeGridColumn(column, columnIndex, event)
      );
      tableElement.current.style.gridTemplateColumns = `${gridColumns.join(
        " "
      )}`;
    },
    [columns, computeGridColumn]
  );

  const handleRemoveListeners = React.useCallback(() => {
    window.removeEventListener("mousemove", handleResizerMouseMove);
    window.removeEventListener("mouseup", handleRemoveListeners);
  }, [handleResizerMouseMove]);

  const handleResizerMouseUp = React.useCallback(() => {
    setActiveIndex(null);
    handleRemoveListeners();
  }, [setActiveIndex, handleRemoveListeners]);

  const handleTableScrollEvent = React.useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      if (!tableElement.current) return;
      const previousTable = tableElement.current?.previousElementSibling;
      const nextTable = tableElement.current?.nextElementSibling;
      if (previousTable)
        previousTable.scrollTop = event.currentTarget.scrollTop;
      if (nextTable) nextTable.scrollTop = event.currentTarget.scrollTop;
    },
    []
  );

  const handleStartDrag = (
    event: React.MouseEvent<HTMLTableElement, MouseEvent>
  ) => {
    if (!tableElement.current) return;
    setIsTableDragging(true);
    setCurrentScrollX(tableElement.current.scrollLeft);
    setDragStartX(event.clientX);
  };

  const handleDragTable = (
    event: React.MouseEvent<HTMLTableElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (!tableElement.current) return;
    if (!isTableDragging) return;
    const deltaX = event.clientX - dragStartX;
    tableElement.current.scrollLeft = currentScrollX - deltaX;
  };

  const handleEndDrag = () => {
    setIsTableDragging(false);
  };

  React.useEffect(() => {
    if (!tableElement.current) return;
    if (!tableElement.current.children[1]) return;
    if (!tableElement.current.getElementsByTagName("tbody")[0]) return;

    const tableBodyRowCount =
      tableElement.current.getElementsByTagName("tbody")[0].childNodes.length;
    setTableHeight(tableBodyRowCount * MIN_HEIGHT + MIN_HEIGHT);
  }, [tableElement.current?.scrollHeight, children]);

  React.useEffect(() => {
    if (activeIndex === null) return;

    window.addEventListener("mousemove", handleResizerMouseMove);
    window.addEventListener("mouseup", handleResizerMouseUp);

    return () => {
      handleRemoveListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <>
      <S.ResizableTable
        ref={tableElement}
        onScroll={handleTableScrollEvent}
        onMouseMove={handleDragTable}
        onMouseDown={handleStartDrag}
        onMouseUp={handleEndDrag}
        onMouseLeave={handleEndDrag}
        headers={verifiedHeaders}
        checkBox={checkBox}
        exceptColumn={exceptColumn}
        $activeIndex={activeIndex}
      >
        {columns.map(({ ref, headerData }, columnIndex) => {
          // eslint-disable-next-line array-callback-return
          if (exceptColumn === headerData.element) return;
          return (
            <ResizableTable.Th
              ref={ref}
              key={`resizable-table-header-${columnIndex}`}
              headerData={headerData}
              checkBox={checkBox}
              tableHeight={tableHeight}
              activeChecker={activeChecker}
              isLastIndex={isLastIndex(columnIndex)}
              columnIndex={columnIndex}
              handleResizerMouseDown={handleResizerMouseDown}
            />
          );
        })}
        {!empty?.isEmpty && <tbody>{children}</tbody>}
      </S.ResizableTable>
    </>
  );
}

const textEllipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CommonTableStyle = styled.table`
  position: relative;
  th {
    position: sticky;
    z-index: 3;
    top: 0;
    background-color: #f9f8fd;
    font-weight: 600;
  }

  tbody,
  tr {
    display: contents;
  }

  th span,
  td span {
    ${textEllipsis}
    display: block;
    font-size: 0.9rem;
  }

  tr td {
    border-top: 1px solid #ccc;
  }

  .resize-handle {
    display: block;
    position: absolute;
    cursor: col-resize;
    width: 7px;
    right: 0;
    top: 0;
    z-index: 1;
    border-right: 2px solid transparent;
    border-color: #ccc;
  }

  .not-resizable {
    display: block;
    position: absolute;
    width: 7px;
    right: 0;
    top: 0;
    z-index: 1;
    border-right: 1px solid transparent;
    border-color: #ccc;
  }

  .resize-handle:hover {
    border-color: #ccc;
  }

  .resize-handle.active {
    border-color: #517ea5;
  }
`;

const S = {
  ResizableTable: styled(CommonTableStyle)<{
    headers: IHeaderData[];
    checkBox?: React.ReactNode;
    exceptColumn?: string;
    $activeIndex: number | null;
  }>`
    display: grid;
    max-height: 678px;
    overflow-x: scroll;
    width: ${(props) => (props.exceptColumn ? "auto" : "100%")};
    border: 1px solid #ccc;
    ::-webkit-scrollbar {
      width: 6px;
      height: 13px;
      cursor: pointer;
    }
    .clicked-cell {
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.8) inset,
        0px 0px 5px rgba(200, 200, 200, 0.5);
    }
    ::-webkit-scrollbar-track {
      background: #00000020;
    }
    ::-webkit-scrollbar-thumb {
      background: #00000030;
      border-radius: 10px;
    }
    ${(props) =>
      (props.$activeIndex === 0 || !!props.$activeIndex) &&
      css`
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      `}
    grid-template-columns: ${(props) =>
      props.headers.map((header) => {
        if (header.element === props.exceptColumn) return;
        return css`minmax(${header.minWidth}px, ${
          header.maxWidth ? `${header.maxWidth}px` : "1fr"
        })`;
      })};
    th,
    td {
      cursor: grab;
      display: flex;
      align-items: center;
      padding: 18px 9px;
      height: 60px;
      font-size: 0.9rem;
    }
    th:last-child,
    td:last-child {
      min-width: ${(props) => props.headers[props.headers.length - 1].minWidth};
    }
    td {
      ${textEllipsis}
    }
  `,
  StaticTable: styled(CommonTableStyle)<{
    headers: IHeaderData[];
    checkBox?: React.ReactNode;
    exceptColumn?: string;
  }>`
    border: 1px solid #ccc;
    display: grid;
    overflow-y: hidden;
    overflow-x: scroll;
    min-width: ${(props) =>
      props.headers.reduce((sum, element) => {
        return sum + (element.minWidth ?? 150);
      }, 0) + 2}px;
    ::-webkit-scrollbar {
      width: 6px;
      height: 13px;
    }
    ::-webkit-scrollbar-track {
    }
    ::-webkit-scrollbar-thumb {
    }
    max-height: 678px;
    grid-template-columns: ${(props) =>
      props.headers.map((header) => {
        if (header.element === props.exceptColumn) return;
        return css`minmax(${header.minWidth}px, ${
          header.maxWidth ? `${header.maxWidth}px` : "1fr"
        })`;
      })};
    th,
    td {
      height: 60px;
      font-size: 0.9rem;
      padding: 18px 9px;
      border-right: 1px solid transparent;
      border-color: #ccc;
      display: flex;
      align-items: center;
    }
    td {
      cursor: pointer;
      ${textEllipsis}
    }
  `,
};

function Td({ justifyContents, children, ...res }: ITd) {
  return (
    <td
      style={{
        justifyContent: computedJustify[justifyContents ?? "start"],
      }}
      {...res}
    >
      {children}
    </td>
  );
}

const ResizableTh = React.forwardRef<HTMLTableHeaderCellElement, ITh>(
  (
    {
      headerData,
      columnIndex,
      tableHeight,
      checkBox,
      isLastIndex,
      handleResizerMouseDown,
      activeChecker,
    },
    ref
  ) => {
    const headerId = React.useId();
    return (
      <th
        ref={ref}
        key={`table-header-${headerId}`}
        style={{
          justifyContent:
            computedJustify[headerData.justifyContents ?? "center"],
        }}
      >
        {headerData.element === "checkBox" && checkBox ? (
          checkBox
        ) : (
          <span>{headerData.element}</span>
        )}
        {!isLastIndex && headerData.isResizable && (
          <div
            style={{ height: tableHeight }}
            onMouseDown={(event) => handleResizerMouseDown(columnIndex, event)}
            className={`resize-handle ${activeChecker(columnIndex)}`}
          />
        )}
        {!headerData.isResizable && (
          <div className="not-resizable" style={{ height: tableHeight }} />
        )}
      </th>
    );
  }
);

ResizableTable.Td = Td;
ResizableTable.Th = ResizableTh;
StaticTable.Td = Td;
