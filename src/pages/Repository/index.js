import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssuesList,
  Button,
  DivButtonPage,
  ButtonPage,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'all',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const { filter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleSetFilter = async setFilter => {
    await this.setState({ filter: setFilter });

    this.componentDidMount();
  };

  handleSetPage = async setPage => {
    const { page } = this.state;

    await this.setState({ page: page + setPage });

    this.componentDidMount();
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <div>
            <Button onClick={() => this.handleSetFilter('all')}>Todos</Button>
            <Button onClick={() => this.handleSetFilter('open')}>Aberto</Button>
            <Button onClick={() => this.handleSetFilter('closed')}>
              Fechado
            </Button>
          </div>
        </Owner>
        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <DivButtonPage>
          <ButtonPage
            disabled={page < 2}
            onClick={() => this.handleSetPage(-1)}
          >
            <IoIosArrowBack />
            Anterior
          </ButtonPage>

          <ButtonPage onClick={() => this.handleSetPage(1)}>
            Próxima
            <IoIosArrowForward />
          </ButtonPage>
        </DivButtonPage>
      </Container>
    );
  }
}
