import React, { Fragment, FunctionComponent,useContext,useEffect, useState } from 'react'
import { BonusGuide, Bonus, Article } from '../../../graphql/schema'
import AquaClient from '../../../graphql/aquaClient'
import { BONUS_GUIDES_BY_COUNTRY } from '../../../graphql/queries/bonusguide'
import NavbarProvider from '../../../components/Navbar/NavbarProvider'
import { HOME_BONUS_LIST } from '../../../graphql/queries/bonus'
import CustomBreadcrumbs from '../../../components/Breadcrumbs/CustomBreadcrumbs'
import styled from 'styled-components'
import BonusGuideCard from '../../../components/Cards/BonusGuideCard'
import Head from 'next/head'
import { ARTICLES_BY_COUNTRY } from '../../../graphql/queries/article'
import ArticleCard from './../../../components/Cards/ArticleCard'
import { tablet } from '../../../components/Responsive/Breakpoints'
import {useRouter} from 'next/router'
import { getCanonicalPath, getUserCountryCode } from '../../../utils/Utils'
import { LocaleContext } from './../../../context/LocaleContext';
import FullPageLoader from '../../../components/Layout/FullPageLoader'
import { HOME } from '../../../graphql/queries/home'
import CountryEquivalentPageSnackbar from '../../../components/Snackbars/CountryEquivalentPageSnackbar'
import { getBGuidePageRedirectUrlForCountry } from './../../../utils/Utils';

interface Props {
    initialGuides: BonusGuide[]
    articles: Article[]
    bonusList: Bonus[],
    _requestedCountryCode:string
}

const automaticRedirect = false

const GuidesList: FunctionComponent<Props> = ({ initialGuides, bonusList, articles,_requestedCountryCode }) => {

    const { t, contextCountry, setContextCountry, userCountry, setUserCountry } = useContext(LocaleContext)
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [userCountryEquivalentExists, setUserCountryEquivalentExists] = useState(false)

    useEffect(() => {
        getCountryData()
    }, [])

    const getCountryData = async () => {
        const geoLocatedCountryCode = await getUserCountryCode()
        setUserCountry(geoLocatedCountryCode)
        const aquaClient = new AquaClient(`https://spikeapistaging.tech/graphql`)

        if(geoLocatedCountryCode !== _requestedCountryCode){
            const initialGuidesResponse = await aquaClient.query({
                query: BONUS_GUIDES_BY_COUNTRY,
                variables: {
                    countryCode: geoLocatedCountryCode
                }
            })
            

            if(initialGuidesResponse.data.data.bonusGuides !== undefined){
                if(automaticRedirect){
                    router.push(getBGuidePageRedirectUrlForCountry(geoLocatedCountryCode))
                    return
                }
                else setUserCountryEquivalentExists(true)
            }
            setContextCountry(_requestedCountryCode)           
        }
        setLoading(false)
    }


    
    if(loading) return <FullPageLoader />
    return (
        <Fragment>

            <Head>
                <title>{t('GuideTextTitlePageTitle')}</title>
                <link rel="canonical" href={getCanonicalPath()} />
                <meta
                    name="description"
                    content={`Non sai come sbloccare i bonus ? Stai cercando una guida che ti spieghi come ottenere le migliore offerte disponibili ? Sei nel posto giusto ! Qui troverai tutte le guide dei migliori Casin?? Italiani con informazioni dettagliate su come sbloccarli ed usufruirne al meglio. Guarda la video spiegazione di SPIKE che ti guider?? passo per passo`}>
                </meta>
                <meta httpEquiv="content-language" content="it-IT"></meta>

                <meta property="og:image" content={'https://spikewebsitemedia.b-cdn.net/spike_share_img.jpg'} />
                <meta property="og:locale" content={'it'} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={`Non sai come sbloccare i bonus ? Stai cercando una guida che ti spieghi come ottenere le migliore offerte disponibili ? Sei nel posto giusto ! Qui troverai tutte le guide dei migliori Casin?? Italiani con informazioni dettagliate su come sbloccarli ed usufruirne al meglio. Guarda la video spiegazione di SPIKE che ti guider?? passo per passo`} />
                <meta property="og:site_name" content="SPIKE Slot | Il Blog n.1 in Italia su Slot Machines e Gioco D'azzardo" />
            </Head>

            <NavbarProvider currentPage='/guide-e-trucchi' countryCode={contextCountry}>
                {userCountryEquivalentExists && <CountryEquivalentPageSnackbar path={getBGuidePageRedirectUrlForCountry(userCountry)} />}

                <StyleProvider>
                    <CustomBreadcrumbs style={{ margin: '1rem 0rem' }} from='guide-list' name='Guides and Tricks' />

                    <h1>{t('Guides to the best bonuses of Italian casinos')} </h1>
                    <p>{t("GuidesTextContent1")}</p>
                    <BonusGuideContainer>
                        {initialGuides.map((guide, index) => <BonusGuideCard key={`guide_${index}`} guide={guide} />)}
                    </BonusGuideContainer>

                    <h1 style={{ margin: '2rem 0rem' }}>{t('Online Slot, Slot Bar and VLT Cheats')} </h1>
                    <p>{t("GuidesTextContent2")}</p>
                    <ArticlesContainer>
                        {articles.map((article, index) => <ArticleCard key={`article_${index}`} article={article} />)}
                    </ArticlesContainer>
                </StyleProvider>

            </NavbarProvider>
        </Fragment>
    )
}

const ArticlesContainer = styled.div`
    display : flex;
    flex-wrap : wrap;
    justify-content : center;
    align-items : center;   

    ${tablet}{
        justify-content : space-between;
    }
`

const StyleProvider = styled.div`
    padding : 1rem 1rem;

    h1{
        font-family : ${(props) => props.theme.text.secondaryFont};
        font-size : 2rem;
        color : ${(props) => props.theme.colors.primary};
    }

    p{
        margin : 1rem 0rem;
    }

    strong{
        font-weight : bold;
    }
`

const BonusGuideContainer = styled.div`
    display : flex;
    flex-wrap : wrap;
     justify-content : center;

    ${tablet}{
        justify-content : space-between;
    }
`

export async function getServerSideProps({ query }) {

    const aquaClient = new AquaClient()

    const countryCode = query.countryCode as string

    const initialGuidesResponse = await aquaClient.query({
        query: BONUS_GUIDES_BY_COUNTRY,
        variables: {
            countryCode: countryCode
        }
    })
    
    const initialArticlesResponse = await aquaClient.query({
        query: ARTICLES_BY_COUNTRY,
        variables: {
            countryCode: countryCode
        }
    })
    

    const bonusListResponse = await aquaClient.query({
        query: HOME_BONUS_LIST,
        variables: {
            countryCode: countryCode
        }
    })    

    return {
        props: {
            initialGuides:initialGuidesResponse.data.data.bonusGuides,
            articles: initialArticlesResponse.data.data.articles,
            bonusList: bonusListResponse.data.data.homes[0]?.bonuses || null,
            _requestedCountryCode:countryCode
        }
    }
}

export default GuidesList
