import { User } from '../models/user'
import { CommitIdentity } from '../models/commit-identity'
import { Diff } from '../models/diff'
import { Repository } from '../models/repository'
import { IAheadBehind } from './git'
import { Branch } from '../models/branch'
import { Commit } from '../models/commit'
import { FileChange, WorkingDirectoryStatus, WorkingDirectoryFileChange } from '../models/status'
import { CloningRepository, ICloningRepositoryState, IGitHubUser } from './dispatcher'
import { ICommitMessage } from './dispatcher/git-store'

export { ICloningRepositoryState }
export { ICommitMessage }
export { IAheadBehind }

export enum SelectionType {
  Repository,
  CloningRepository,
}

export type PossibleSelections = { type: SelectionType.Repository, repository: Repository, state: IRepositoryState } |
                                 { type: SelectionType.CloningRepository, repository: CloningRepository, state: ICloningRepositoryState }

/** All of the shared app state. */
export interface IAppState {
  readonly users: ReadonlyArray<User>
  readonly repositories: ReadonlyArray<Repository | CloningRepository>

  readonly selectedState: PossibleSelections | null

  readonly showWelcomeFlow: boolean
  readonly loading: boolean
  readonly currentPopup: Popup | null
  readonly currentFoldout: Foldout | null
  readonly appMenu: Electron.Menu | null

  readonly errors: ReadonlyArray<IAppError>

  /** Map from the emoji shortcut (e.g., :+1:) to the image's local path. */
  readonly emoji: Map<string, string>

  /**
   * The width of the repository sidebar.
   *
   * This affects the changes and history sidebar
   * as well as the first toolbar section which contains
   * repo selection on all platforms and repo selection and
   * app menu on Windows.
   *
   * Lives on IAppState as opposed to IRepositoryState
   * because it's used in the toolbar as well as the
   * repository.
   */
  readonly sidebarWidth: number
}

export interface IAppError {
  /** The name of the error. This is for application use only. */
  readonly name: string

  /** The user-facing message. */
  readonly message: string
}

export enum PopupType {
  CreateBranch = 1,
  AddRepository,
  RenameBranch,
  PublishRepository,
  DeleteBranch,
  ConfirmDiscardChanges,
}

export type Popup = { type: PopupType.CreateBranch, repository: Repository } |
                    { type: PopupType.AddRepository } |
                    { type: PopupType.RenameBranch, repository: Repository, branch: Branch } |
                    { type: PopupType.PublishRepository, repository: Repository } |
                    { type: PopupType.DeleteBranch, repository: Repository, branch: Branch } |
                    { type: PopupType.ConfirmDiscardChanges, repository: Repository, files: ReadonlyArray<WorkingDirectoryFileChange> }

export enum FoldoutType {
  Repository,
  Branch,
  AppMenu,
}

export type Foldout =
  { type: FoldoutType.Repository } |
  { type: FoldoutType.Branch } |
  { type: FoldoutType.AppMenu }

export enum RepositorySection {
  Changes,
  History
}

export interface IRepositoryState {
  readonly historyState: IHistoryState
  readonly changesState: IChangesState
  readonly selectedSection: RepositorySection

  /**
   * The name and email that will be used for the author info
   * when committing barring any race where user.name/user.email is
   * updated between us reading it and a commit being made
   * (ie we don't currently use this value explicitly when committing)
   */
  readonly commitAuthor: CommitIdentity | null

  readonly branchesState: IBranchesState

  /**
   * Mapping from lowercased email addresses to the associated GitHub user. Note
   * that an email address may not have an associated GitHub user, or the user
   * may still be loading.
   */
  readonly gitHubUsers: Map<string, IGitHubUser>

  /** The commits loaded, keyed by their full SHA. */
  readonly commits: Map<string, Commit>

  /**
   * The ordered local commit SHAs. The commits themselves can be looked up in
   * `commits.`
   */
  readonly localCommitSHAs: ReadonlyArray<string>

  /** The name of the remote. */
  readonly remoteName: string | null

  /** The state of the current branch in relation to its upstream. */
  readonly aheadBehind: IAheadBehind | null

  /** Is a push/pull/update in progress? */
  readonly pushPullInProgress: boolean

  /** The date the repository was last fetched. */
  readonly lastFetched: Date | null
}

export interface IBranchesState {
  readonly currentBranch: Branch | null
  readonly defaultBranch: Branch | null
  readonly allBranches: ReadonlyArray<Branch>
  readonly recentBranches: ReadonlyArray<Branch>
}

export interface IHistorySelection {
  readonly sha: string | null
  readonly file: FileChange | null
}

export interface IHistoryState {
  readonly selection: IHistorySelection

  /** The ordered SHAs. */
  readonly history: ReadonlyArray<string>

  readonly changedFiles: ReadonlyArray<FileChange>

  readonly diff: Diff | null
}

export interface IChangesState {
  readonly workingDirectory: WorkingDirectoryStatus
  readonly selectedFile: WorkingDirectoryFileChange | null
  readonly diff: Diff | null

  /**
   * The commit message to use based on the contex of the repository, e.g., the
   * message from a recently undone commit.
   */
  readonly contextualCommitMessage: ICommitMessage | null

  /** The commit message for a work-in-progress commit in the changes view. */
  readonly commitMessage: ICommitMessage | null
}
