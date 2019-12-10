import React, { Component } from 'react';
import clsx from 'clsx';

const MentionLink = React.forwardRef(
  ({ mention, children, className }, ref) => (
    <a ref={ref} href={mention.link} className={className} spellCheck={false}>
      {children}
    </a>
  )
);

const MentionText = React.forwardRef(({ children, className }, ref) => (
  <span ref={ref} className={className} spellCheck={false}>
    {children}
  </span>
));

export default class Mention extends Component {
  constructor(props) {
    super(props);
    // Note: this is a workaround for an obscure issue: https://github.com/draft-js-plugins/draft-js-plugins/pull/667/files
    // Ideally we can remove this in the future.
    this.mentionRef = element => {
      this.mentionPortal = element;
    };
  }

  // When inputting Japanese characters (or any complex alphabet which requires
  // hitting enter to commit the characters), that action was causing a race
  // condition when we used UNSAFE_componentWillMount. By using componentDidMount
  // instead of UNSAFE_componentWillMount, the component will unmount unregister and
  // then properly mount and register after. Prior to this change,
  // UNSAFE_componentWillMount would not fire after componentWillUnmount even though it
  // was still in the DOM, so it wasn't re-registering the entityKey.
  componentDidMount() {
    this.props.store.registerMention(this.props.entityKey);
    this.updateMentionClientRect(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.updateMentionClientRect(nextProps);
  }

  componentWillUnmount() {
    this.props.store.unregisterMention(this.props.entityKey);
  }

  updateMentionClientRect(props) {
    if (this.props.entityKey !== props.entityKey) {
      this.props.store.unregisterMention(this.props.entityKey);
      this.props.store.registerMention(props.entityKey);
    }

    this.props.store.updateMentionClientRect(props.entityKey, () =>
      this.mentionPortal.getBoundingClientRect()
    );
  }

  render() {
    const {
      entityKey,
      theme = {},
      mentionComponent,
      children,
      decoratedText,
      className,
      contentState,
    } = this.props;

    const combinedClassName = clsx(theme.mention, className);
    const mention = contentState.getEntity(entityKey).getData().mention;

    const MComponent =
      mentionComponent || (mention.link ? MentionLink : MentionText);

    return (
      <MComponent
        ref={this.mentionRef}
        entityKey={entityKey}
        mention={mention}
        theme={theme}
        className={combinedClassName}
        decoratedText={decoratedText}
      >
        {children}
      </MComponent>
    );
  }
}
