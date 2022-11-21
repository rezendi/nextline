import { useRouter } from 'next/router';
import Head from 'next/head'
import ReactHtmlParser from 'react-html-parser'; 
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent } from '@mui/lab';
const base64 = require('universal-base64');
const yaml = require('js-yaml');

export default function Line({line, error}) {
  const router = useRouter();
  const { lid } = router.query;

  return (
    <div className="container">
      <Head>
        <title>Nextline</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">{line.title}</h1>
        <div className="counter">{line.entries.length} entries</div>
        {false && <p>{JSON.stringify(line.entries[1])}</p>}

        <Timeline>
          {line.entries.map((entry) =>
            <TimelineItem key={entry.url}>
              <TimelineOppositeContent>
                {entry.image &&
                  <div className="imageContainer"><a href={entry.url}><img className="image" src={entry.image}/></a></div>
                }
                <span className="source">{entry.source}</span>
                &nbsp;
                <span className="sourceLink"><a href={entry.url}>{new Date(entry.when).toLocaleDateString()}</a></span>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div className="summary">{entry.summary}</div>
                <div className="comments">{ ReactHtmlParser(entry.comments) }</div>
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </main>

      <footer>
        A view of &nbsp;
        <a href="https://scryline.com/">Scryline</a>
      </footer>

      <style jsx>{`
      .comments {
        font-size:small;
      }

      .image {
        max-width:160px;
      }
      `}</style>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  var files = [];
	try {
    let owner = process.env.GITHUB_ACCOUNT;
    let repo = process.env.GITHUB_REPO;
    let headers = {
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3+json",
      "Authorization": `Basic ${base64.encode(`${owner}:${process.env.GITHUB_TOKEN}`)}`
    };

    let api_url = `https://api.github.com/repos/${owner}/${repo}/contents/lines`;
    for (let i in params.lid) {
      api_url = api_url+"/"+params.lid[i];
    }
    console.log("api_url", api_url);

    var response = await fetch(api_url, { method: 'GET', headers: headers });
    let line = await response.json();
    let converted = base64.decode(line.content);
    let retval = yaml.load(converted);
    // console.log("files", files);
    return {
      props: { success:true, line:retval },
      revalidate: 60,
    };

  } catch(error) {
    console.log("error", error);
    return {
      props: { success:false, error:JSON.stringify(error), files:files },
      revalidate: 30,
    };
  }
}