import "./App.css";
import styled from "styled-components";
import ResizableTable, { IHeaderData } from "./components/ResizableTable";
const resizableTableHeader: IHeaderData[] = [
  {
    element: "A",
  },
  { element: "B" },
  { element: "C" },
];
function App() {
  return (
    <div className="App">
      <S.TableContainer>
        <ResizableTable headers={resizableTableHeader}>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
          <tr>
            <ResizableTable.Td>
              <span>1</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>2</span>
            </ResizableTable.Td>
            <ResizableTable.Td>
              <span>3</span>
            </ResizableTable.Td>
          </tr>
        </ResizableTable>
      </S.TableContainer>
    </div>
  );
}

const S = {
  TableContainer: styled.div`
    display: flex;
    margin-top: 100px;
  `,
};

export default App;
