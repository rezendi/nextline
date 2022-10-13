import { useRouter } from 'next/router';
import Head from 'next/head'
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
      <h1>{line.title}</h1>
      <p>entries {line.entries.length}</p>
      <Timeline>
        {line.entries.map((entry) =>
          <TimelineItem>
            <TimelineOppositeContent><a href="{entry.url}">{entry.when}</a></TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>{entry.summary}<br/>{entry.comments}</TimelineContent>
          </TimelineItem>
        )}
        </Timeline>
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