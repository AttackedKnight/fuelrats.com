// Module imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'





// Component imports
import { PageWrapper, authenticated } from '../../../components/AppLayout'
import { formatAsEliteDateTime } from '../../../helpers/formatTime'
import { Link, Router } from '../../../routes'
import { actions, connect } from '../../../store'
import {
  selectRatsByRescueId,
  selectRescueById,
  selectRescueCanEdit,
  withCurrentUserId,
  selectUserByIdHasScope,
} from '../../../store/selectors'





@authenticated
@connect
class Paperwork extends React.Component {
  /***************************************************************************\
    Properties
  \***************************************************************************/

  state = {
    loading: !this.props.rescue,
    deleteConfirm: false,
    deleting: false,
  }





  /***************************************************************************\
    Private Methods
  \***************************************************************************/

  _handleDeleteClick = async () => {
    if (this.state.deleteConfirm) {
      this.setState({ deleting: true })

      await this.props.deleteRescue(this.props.rescue.id)

      Router.pushRoute(
        this.props.userCanEditAllRescues
          ? 'admin rescues list'
          : '/',
      )

      return
    }

    this.setState({ deleteConfirm: true })
  }

  _handleDeleteCancel = () => {
    this.setState({ deleteConfirm: false })
  }





  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  async componentDidMount () {
    const { id, rescue } = this.props

    if (id && !rescue) {
      await this.props.getRescue(id)
    }

    if (this.state.loading) {
      this.setState({ loading: false })
    }
  }

  static renderQuote = (quote) => {
    const createdAt = formatAsEliteDateTime(quote.createdAt)
    const updatedAt = formatAsEliteDateTime(quote.updatedAt)
    return (
      <li key={quote.createdAt}>
        <div className="times">
          <div className="created" title="Created at">{createdAt}</div>
          {(updatedAt !== createdAt) && (
            <div className="updated" title="Updated at">
              <span className="label">{'Updated at '}</span>
              {updatedAt}
            </div>
          )}
        </div>
        <span className="message">{quote.message}</span>
        <div className="authors">
          <div className="author" title="Created by">{quote.author}</div>
          {(quote.author !== quote.lastAuthor) && (
            <div className="last-author" title="Last updated by">
              <span className="label">{'Updated by '}</span>
              {quote.lastAuthor}
            </div>
          )}
        </div>
      </li>
    )
  }

  static async getInitialProps ({ query, store }) {
    const state = store.getState()

    if (!selectRescueById(state, query)) {
      await actions.getRescue(query.rescueId)(store.dispatch)
    }
  }

  renderQuotes = () => {
    const { rescue } = this.props

    if (rescue.attributes.quotes) {
      return (
        <ol>
          {rescue.attributes.quotes.map(Paperwork.renderQuote)}
        </ol>
      )
    }

    return (
      <span>{'N/A'}</span>
    )
  }

  renderRat = (rat) => {
    const { rescue } = this.props
    return (
      <li key={rat.id} className="first-limpet">
        {rat.attributes.name}
        {(rat.id === rescue.attributes.firstLimpetId) && (
          <span className="badge first-limpet">{'1st'}</span>
        )}
      </li>
    )
  }

  renderRats = () => {
    const { rats } = this.props
    const { rescue } = this.props

    return (
      <ul>
        {rats.map(this.renderRat)}
        {rescue.attributes.unidentifiedRats.map((rat) => <li key={rat} className="unidentified">{rat}<span className="badge">{'UnID'}</span></li>)}
      </ul>
    )
  }

  renderRescue = () => {
    const {
      rescue,
      userCanEdit,
      userCanDelete,
    } = this.props

    const {
      deleteConfirm,
      deleting,
    } = this.state

    // This makes 2 new variables called status and outcome, and sets them to the values of the outcome and status in the rescue object.
    let {
      status,
      outcome,
    } = rescue.attributes

    if (status === 'inactive') {
      status = 'open'
      outcome = 'inactive'
    } else if (status === 'open') {
      outcome = 'active'
    }

    return (
      <>
        <menu type="toolbar">
          <div className="primary">
            {deleteConfirm && (
              <>
                {deleting ? (
                  <span>{'Deleting... '}<FontAwesomeIcon icon="spinner" pulse fixedWidth /> </span>
                ) : (
                  <span>{'Delete this rescue? (This cannot be undone!) '}</span>
                )}

                <button
                  className="compact"
                  disabled={deleting}
                  onClick={this._handleDeleteClick}
                  type="button">
                  {'Yes'}
                </button>

                <button
                  className="compact"
                  disabled={deleting}
                  onClick={this._handleDeleteCancel}
                  type="button">
                  {'No'}
                </button>
              </>
            )}

            {!deleteConfirm && (
              <>
                {userCanEdit && (
                  <Link route="paperwork edit" params={{ rescueId: rescue.id }}>
                    <a className="button compact">
                      {'Edit'}
                    </a>
                  </Link>
                )}
                {userCanDelete && (
                  <button
                    className="compact"
                    onClick={this._handleDeleteClick}
                    type="button">
                    {'Delete'}
                  </button>
                )}
              </>
            )}
          </div>

          <div className="secondary" />
        </menu>

        <header className="paperwork-header">
          {(rescue.attributes.status !== 'closed') && (rescue.attributes.data) && (
            <div className="board-index"><span>{`#${rescue.attributes.data.boardIndex}`}</span></div>
          )}
          <div className="title">
            {(!rescue.attributes.title) && (
              <span>
                {'Rescue of '}
                <span className="cmdr-name">{rescue.attributes.client}</span>
                {' in '}
                <span className="system">{(rescue.attributes.system) || ('Unknown')}</span>
              </span>
            )}
            {(rescue.attributes.title) && (
              <span>
                {'Operation '}
                <span className="rescue-title">{rescue.attributes.title}</span>
              </span>
            )}
          </div>
        </header>

        <div className="rescue-tags">
          <div className="tag status-group">
            <span className={`status ${status}`}>{status}</span>
            <span className="outcome">{outcome || 'unfiled'}</span>
          </div>

          <div className={`tag platform ${rescue.attributes.platform || 'none'}`}>{rescue.attributes.platform || 'No Platform'}</div>

          {(rescue.attributes.codeRed) && (
            <div className="tag code-red">{'CR'}</div>
          )}

          {rescue.attributes.data?.markedForDeletion?.marked && (
            <div className="md-group">
              <div className="marked-for-deletion">{'Marked for Deletion'}</div>
              <div className="md-reason">
                {`"${rescue.attributes.data.markedForDeletion?.reason}"`}
                <div className="md-reporter">{` - ${rescue.attributes.data.markedForDeletion.reporter}`}</div>
              </div>
            </div>
          )}
        </div>

        <div className="info">
          {(rescue.attributes.title) && (
            <>
              <span className="label">{'Client '}</span>
              <span className="cmdr-name">{rescue.attributes.client}</span>
              <span className="label">{'System '}</span>
              <span className="system">{(rescue.attributes.system) || ('Unknown')}</span>
            </>
          )}
          <span className="label">{'Created'}</span>
          <span className="date-created content">{formatAsEliteDateTime(rescue.attributes.createdAt)}</span>
          <span className="label">{'Updated'}</span>
          <span className="date-updated content">{formatAsEliteDateTime(rescue.attributes.updatedAt)}</span>
          {Boolean(rescue.attributes.data) && (
            <>
              <span className="label">{'IRC Nick'}</span>
              <span className="irc-nick content">{rescue.attributes.data.IRCNick}</span>
              <span className="label">{'Language'}</span>
              <span className="language content">{rescue.attributes.data.langID}</span>
            </>
          )}
        </div>

        <div className="panel rats">
          <header>{'Rats'}</header>
          <div className="panel-content">{this.renderRats()}</div>
        </div>

        <div className="panel quotes">
          <header>{'Quotes'}</header>
          <div className="panel-content">{this.renderQuotes()}</div>
        </div>

        <div className="panel notes">
          <header>{'Notes'}</header>
          <div className="panel-content">{rescue.attributes.notes}</div>
        </div>
      </>
    )
  }

  render () {
    const {
      rescue,
    } = this.props

    const {
      loading,
    } = this.state

    return (
      <PageWrapper title="Paperwork">

        {loading && (
          <div className="loading page-content" />
        )}

        {(!loading && !rescue) && (
          <div className="loading page-content">
            <p>{"Sorry, we couldn't find the paperwork you requested."}</p>
          </div>
        )}

        {(!loading && rescue) && (
          <div className="page-content">
            {this.renderRescue()}
          </div>
        )}
      </PageWrapper>
    )
  }





  /***************************************************************************\
    Redux Properties
  \***************************************************************************/

  static mapDispatchToProps = ['getRescue', 'deleteRescue']

  static mapStateToProps = (state, { query }) => ({
    rats: selectRatsByRescueId(state, query) || [],
    rescue: selectRescueById(state, query),
    userCanEdit: selectRescueCanEdit(state, query),
    userCanDelete: withCurrentUserId(selectUserByIdHasScope)(state, { scope: 'rescue.delete' }),
    userCanEditAllRescues: withCurrentUserId(selectUserByIdHasScope)(state, { scope: 'rescue.write' }),
  })
}





export default Paperwork
