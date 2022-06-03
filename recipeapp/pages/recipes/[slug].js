
import { useState } from "react";
import {
  sanityClient,
  urlFor,
  usePreviewSubscription,
} from "../../lib/sanity";

import { PortableText } from "@portabletext/react";

const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      mainImage{
        asset -> {
          _id,
          url
        }
      },
      ingredient[]{
        _key,
        unit,
        wholeNumber,
        fraction,
        ingredient->{
          name
        }
      },
      instructions,
      likes
    }`;

export default function OneRecipe({ data, preview }) {
  if (!data) return <div>Loading...</div>;
  const { data: recipe } = usePreviewSubscription(recipeQuery, {
    params: { slug: data.recipe?.slug.current },
    initialData: data,
    enabled: preview,
  });

  

  const [likes, setLikes] = useState(data?.recipe?.likes);

  const addLike = async () => {
    const res = await fetch("/api/handle-like", {
      method: "POST",
      body: JSON.stringify({ _id: recipe._id }),
    }).catch((error) => console.log(error));

    const data = await res.json();

    setLikes(data.likes);
  };
  return (
    <article className="recipe">
      <h1>{data.recipe.name}</h1>

      <button className="like-button" onClick={addLike}>
        {likes} ❤️
      </button>

      <main className="content">
        <img src={urlFor(data.recipe?.mainImage).url()} alt={recipe.name} />
        <div className="breakdown">
          <ul className="ingredients">
            {data.recipe.ingredient?.map((ingredient) => (
              <li key={ingredient._key} className="ingredient">
                {ingredient?.wholeNumber}
                {ingredient?.fraction} {ingredient?.unit}
                <br />
                {ingredient?.ingredient?.name}
              </li>
            ))}
          </ul>
          <div>
            <PortableText
              value={data.recipe?.instructions}
              className="instructions"
            />
          </div>
        </div>
      </main>
    </article>
  );
}

export async function getStaticPaths() {
  const paths = await sanityClient.fetch(
    `*[_type == "recipe" && defined(slug.current)]{
      "params": {
        "slug": slug.current
      }
    }`
  );

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const recipe = await sanityClient.fetch(recipeQuery, { slug });
  return { props: { data: { recipe }, preview: true } };
}