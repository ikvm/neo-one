import { ActionMap } from 'constate';
import * as React from 'react';
import { connect } from 'react-redux';
import { Container, Flex, styled } from 'reakit';
import { Observable } from 'rxjs';
import { ReduxStoreProvider } from '../../containers';
import { ComponentProps } from '../../types';
import { Editor } from './Editor';
import { EditorToolbar } from './EditorToolbar';
import { configureStore, setFileProblems } from './redux';
import { EditorFile, EditorFiles, FileDiagnostic, TextRange } from './types';

const Wrapper = styled(Flex)`
  align-self: stretch;
  justify-self: stretch;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

interface ExternalProps {
  readonly selectedFile: EditorFile;
  readonly files: EditorFiles;
  readonly extraFiles?: EditorFiles;
  readonly onSelectFile: (file: EditorFile) => void;
  readonly onChangeFile: (file: EditorFile) => void;
  readonly build: (file: EditorFile) => Observable<string>;
}

interface State {
  readonly pendingFile?: EditorFile;
  readonly pendingRange?: TextRange;
  readonly range?: TextRange;
}

const INITIAL_STATE: State = {};

interface Actions {
  readonly setRange: (range: TextRange) => void;
  readonly setPendingRange: (file: EditorFile, range: TextRange) => void;
}

const actions: ActionMap<State, Actions> = {
  setRange: (range: TextRange) => () => ({
    pendingFile: undefined,
    pendingRange: undefined,
    range,
  }),
  setPendingRange: (file: EditorFile, range: TextRange) => () => ({
    pendingFile: file,
    pendingRange: range,
    range: undefined,
  }),
};

interface Props extends ExternalProps {
  readonly onChangeProblems: (path: string, diagnostics: ReadonlyArray<FileDiagnostic>) => void;
}

const SimpleEditorBase = ({
  selectedFile,
  files,
  extraFiles,
  onChangeFile,
  onSelectFile,
  onChangeProblems,
  build,
  ...props
}: Props & ComponentProps<typeof Wrapper>) => (
  <Container initialState={INITIAL_STATE} actions={actions}>
    {({ range, pendingRange, pendingFile, setRange, setPendingRange }) => (
      <Wrapper {...props}>
        <Editor
          selectedFile={selectedFile}
          files={files}
          extraFiles={extraFiles}
          onSelectFile={onSelectFile}
          onChangeFile={onChangeFile}
          onChangeProblems={onChangeProblems}
          range={
            range === undefined
              ? pendingFile !== undefined && pendingFile.path === selectedFile.path
                ? pendingRange
                : undefined
              : range
          }
        />
        <EditorToolbar
          selectedFile={selectedFile}
          files={files}
          build={build}
          onSelectRange={(file, nextRange) => {
            if (file.path === selectedFile.path) {
              setRange(nextRange);
            } else {
              setPendingRange(file, nextRange);
              onSelectFile(file);
            }
          }}
        />
      </Wrapper>
    )}
  </Container>
);

const ConnectedSimpleEditor = connect(
  undefined,
  (dispatch) => ({
    // tslint:disable-next-line no-unnecessary-type-annotation
    onChangeProblems: (path: string, diagnostics: ReadonlyArray<FileDiagnostic>) =>
      dispatch(setFileProblems({ path, problems: diagnostics })),
  }),
)(SimpleEditorBase);

export const SimpleEditor = (props: ExternalProps) => (
  <ReduxStoreProvider createStore={configureStore}>
    <ConnectedSimpleEditor {...props} />
  </ReduxStoreProvider>
);
